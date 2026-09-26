<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\StripeWebhookEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Event;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\StripeClient;
use Stripe\Webhook;

class PaymentService
{
    public function __construct(private StripeClient $stripe) {}

    /**
     * Ensures the user has a Stripe Customer, creating one on first use.
     * Payment methods are attached to this customer, not to individual
     * bookings, so a saved card can be reused across trips.
     */
    public function ensureStripeCustomer(User $user): string
    {
        if ($user->stripe_customer_id) {
            return $user->stripe_customer_id;
        }

        $customer = $this->stripe->customers->create([
            'email' => $user->email,
            'name' => trim("{$user->first_name} {$user->last_name}"),
            'metadata' => ['user_id' => $user->id],
        ]);

        $user->stripe_customer_id = $customer->id;
        $user->saveQuietly();

        return $customer->id;
    }

    /**
     * Creates a PaymentIntent for the amount already calculated and stored
     * on the booking at creation time — the amount is never recalculated
     * from, or accepted from, the request that hits this method.
     *
     * @throws ApiErrorException
     */
    public function createIntentForBooking(Booking $booking): array
    {
        return DB::transaction(function () use ($booking) {
            $existing = $booking->payment;
            if ($existing && in_array($existing->status, ['requires_payment_method', 'requires_action', 'processing'], true)) {
                $intent = $this->stripe->paymentIntents->retrieve($existing->stripe_payment_intent_id);

                return ['clientSecret' => $intent->client_secret, 'payment' => $existing];
            }

            $customerId = $this->ensureStripeCustomer($booking->user);
            $amountMinorUnits = (int) round(((float) $booking->fare) * 100);

            $intent = $this->stripe->paymentIntents->create([
                'amount' => $amountMinorUnits,
                'currency' => strtolower($booking->currency),
                'customer' => $customerId,
                'automatic_payment_methods' => ['enabled' => true],
                'metadata' => [
                    'booking_id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'booking_reference' => $booking->reference,
                ],
            ]);

            $payment = Payment::create([
                'booking_id' => $booking->id,
                'user_id' => $booking->user_id,
                'stripe_payment_intent_id' => $intent->id,
                'amount' => $amountMinorUnits,
                'currency' => strtolower($booking->currency),
                'status' => $intent->status,
            ]);

            return ['clientSecret' => $intent->client_secret, 'payment' => $payment];
        });
    }

    public function constructWebhookEvent(string $payload, string $signature): Event
    {
        return Webhook::constructEvent($payload, $signature, config('services.stripe.webhook_secret'));
    }

    /**
     * Idempotent by design: every Stripe event ID is recorded before
     * processing, inside the same transaction as the state change it
     * causes, so a redelivered webhook is a guaranteed no-op.
     */
    public function handleWebhookEvent(Event $event): void
    {
        if (StripeWebhookEvent::where('stripe_event_id', $event->id)->exists()) {
            Log::info('Stripe webhook event already processed, skipping', ['event_id' => $event->id]);

            return;
        }

        DB::transaction(function () use ($event) {
            StripeWebhookEvent::create([
                'stripe_event_id' => $event->id,
                'type' => $event->type,
                'processed_at' => now(),
            ]);

            match ($event->type) {
                'payment_intent.succeeded' => $this->onPaymentSucceeded($event->data->object),
                'payment_intent.payment_failed' => $this->onPaymentFailed($event->data->object),
                'payment_intent.processing' => $this->onPaymentStatusChanged($event->data->object, 'processing'),
                'payment_intent.canceled' => $this->onPaymentStatusChanged($event->data->object, 'canceled'),
                default => Log::info('Unhandled Stripe event type', ['type' => $event->type]),
            };
        });
    }

    private function onPaymentSucceeded(PaymentIntent $intent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $intent->id)->first();
        if (! $payment) {
            Log::warning('Stripe payment_intent.succeeded for unknown payment', ['intent' => $intent->id]);

            return;
        }

        $payment->status = 'succeeded';
        $payment->payment_method_type = $intent->payment_method_types[0] ?? null;
        $payment->save();

        $booking = $payment->booking;
        if ($booking->status === 'pending_payment') {
            $booking->status = 'confirmed';
            $booking->save();
            app(BookingService::class)->sendConfirmation($booking);
        }
    }

    private function onPaymentFailed(PaymentIntent $intent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $intent->id)->first();
        if (! $payment) {
            return;
        }

        $payment->status = 'failed';
        $payment->save();
        // Booking stays `pending_payment` — the customer can retry from the
        // frontend, which will reuse or recreate the PaymentIntent.
    }

    private function onPaymentStatusChanged(PaymentIntent $intent, string $status): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $intent->id)->first();
        if ($payment) {
            $payment->status = $status;
            $payment->save();
        }
    }

    // -- Saved payment methods (real Stripe PaymentMethods, no local card storage) --

    public function createSetupIntent(User $user): string
    {
        $customerId = $this->ensureStripeCustomer($user);

        $setupIntent = $this->stripe->setupIntents->create([
            'customer' => $customerId,
            'automatic_payment_methods' => ['enabled' => true],
        ]);

        return $setupIntent->client_secret;
    }

    public function listPaymentMethods(User $user): array
    {
        if (! $user->stripe_customer_id) {
            return [];
        }

        $methods = $this->stripe->paymentMethods->all([
            'customer' => $user->stripe_customer_id,
            'type' => 'card',
        ]);

        $customer = $this->stripe->customers->retrieve($user->stripe_customer_id);
        $defaultId = $customer->invoice_settings->default_payment_method ?? null;

        return array_map(fn ($pm) => [
            'id' => $pm->id,
            'provider' => 'stripe',
            'brand' => ucfirst($pm->card->brand),
            'last4' => $pm->card->last4,
            'expiry' => sprintf('%02d/%s', $pm->card->exp_month, substr((string) $pm->card->exp_year, -2)),
            'isDefault' => $pm->id === $defaultId,
        ], $methods->data);
    }

    public function attachPaymentMethod(User $user, string $paymentMethodId): void
    {
        $customerId = $this->ensureStripeCustomer($user);

        $this->stripe->paymentMethods->attach($paymentMethodId, ['customer' => $customerId]);

        // First saved card becomes the default automatically.
        $existing = $this->stripe->paymentMethods->all(['customer' => $customerId, 'type' => 'card']);
        if (count($existing->data) === 1) {
            $this->setDefaultPaymentMethod($user, $paymentMethodId);
        }

        if (! $user->default_card_provider) {
            $user->forceFill(['default_card_provider' => 'stripe'])->saveQuietly();
        }
    }

    public function detachPaymentMethod(User $user, string $paymentMethodId): void
    {
        $pm = $this->stripe->paymentMethods->retrieve($paymentMethodId);
        if ($pm->customer !== $user->stripe_customer_id) {
            abort(403, 'You are not authorized to perform this action.');
        }

        $this->stripe->paymentMethods->detach($paymentMethodId);
    }

    public function setDefaultPaymentMethod(User $user, string $paymentMethodId): void
    {
        $pm = $this->stripe->paymentMethods->retrieve($paymentMethodId);
        if ($pm->customer !== $user->stripe_customer_id) {
            abort(403, 'You are not authorized to perform this action.');
        }

        $this->stripe->customers->update($user->stripe_customer_id, [
            'invoice_settings' => ['default_payment_method' => $paymentMethodId],
        ]);
    }
}
