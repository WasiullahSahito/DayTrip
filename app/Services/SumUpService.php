<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * SumUp card vault + charging, mirroring what PaymentService does for Stripe.
 *
 * Card numbers are entered into SumUp's own Card Widget in the browser and
 * never reach this API. A card is saved by completing a checkout with
 * purpose SETUP_RECURRING_PAYMENT for a SumUp customer; the resulting
 * payment instrument's token is then used to charge the card later.
 *
 * Saved-card ids exposed to the frontend are "sumup:<token>" so they can't
 * collide with Stripe's pm_... ids.
 */
class SumUpService
{
    public const ID_PREFIX = 'sumup:';

    public function isConfigured(): bool
    {
        return filled(config('services.sumup.api_key')) && filled(config('services.sumup.merchant_code'));
    }

    public static function isSumUpCardId(string $id): bool
    {
        return str_starts_with($id, self::ID_PREFIX);
    }

    // -- Saving a card --------------------------------------------------

    /**
     * Creates the checkout the Card Widget mounts against to save a card.
     */
    public function createSetupCheckout(User $user): string
    {
        $customerId = $this->ensureCustomer($user);

        $checkout = $this->send(fn () => $this->http()->post('/v0.1/checkouts', [
            'checkout_reference' => "setup-{$user->id}-".Str::random(12),
            'amount' => (float) config('services.sumup.setup_amount'),
            'currency' => 'EUR',
            'merchant_code' => config('services.sumup.merchant_code'),
            'description' => 'Save card',
            'customer_id' => $customerId,
            'purpose' => 'SETUP_RECURRING_PAYMENT',
        ]));

        return $checkout['id'];
    }

    /**
     * Called after the widget reports success. The frontend's word isn't
     * trusted — the checkout is re-read from SumUp and must be PAID, belong
     * to this user, and be a card-setup checkout.
     *
     * @return array<int, array<string, mixed>> the user's SumUp cards
     */
    public function confirmSetup(User $user, string $checkoutId): array
    {
        $checkout = $this->send(fn () => $this->http()->get('/v0.1/checkouts/'.rawurlencode($checkoutId)));

        $reference = (string) ($checkout['checkout_reference'] ?? '');
        if (! str_starts_with($reference, "setup-{$user->id}-")) {
            abort(403, 'You are not authorized to perform this action.');
        }

        if (($checkout['status'] ?? null) !== 'PAID') {
            throw new RuntimeException('Card setup was not completed.');
        }

        $cards = $this->listCards($user);

        if ($cards && ! $user->sumup_default_token) {
            $user->forceFill(['sumup_default_token' => $this->tokenFromId($cards[0]['id'])]);
        }
        if ($cards && ! $user->default_card_provider) {
            $user->forceFill(['default_card_provider' => 'sumup']);
        }
        $user->saveQuietly();

        return $this->listCards($user);
    }

    // -- Saved cards ----------------------------------------------------

    /**
     * @return array<int, array{id: string, provider: string, brand: string, last4: string, expiry: ?string, isDefault: bool}>
     */
    public function listCards(User $user): array
    {
        if (! $this->isConfigured() || ! $user->sumup_customer_id) {
            return [];
        }

        $instruments = $this->send(fn () => $this->http()
            ->get('/v0.1/customers/'.rawurlencode($user->sumup_customer_id).'/payment-instruments'));

        $active = array_values(array_filter($instruments, fn ($i) => ($i['active'] ?? true) && ($i['type'] ?? 'card') === 'card'));

        $defaultToken = $user->sumup_default_token;
        // If the stored default has been removed, the first card stands in.
        $hasDefault = collect($active)->contains(fn ($i) => $i['token'] === $defaultToken);

        return array_map(fn ($i, $index) => [
            'id' => self::ID_PREFIX.$i['token'],
            'provider' => 'sumup',
            'brand' => Str::title(strtolower((string) ($i['card']['type'] ?? 'Card'))),
            'last4' => (string) ($i['card']['last_4_digits'] ?? '••••'),
            // SumUp doesn't return an expiry for saved instruments.
            'expiry' => null,
            'isDefault' => $hasDefault ? $i['token'] === $defaultToken : $index === 0,
        ], $active, array_keys($active));
    }

    public function removeCard(User $user, string $cardId): void
    {
        $token = $this->ownedToken($user, $cardId);

        $this->send(fn () => $this->http()->delete(
            '/v0.1/customers/'.rawurlencode($user->sumup_customer_id).'/payment-instruments/'.rawurlencode($token)
        ));

        if ($user->sumup_default_token === $token) {
            $user->forceFill(['sumup_default_token' => null])->saveQuietly();
        }
    }

    public function setDefault(User $user, string $cardId): void
    {
        $token = $this->ownedToken($user, $cardId);

        $user->forceFill(['sumup_default_token' => $token, 'default_card_provider' => 'sumup'])->saveQuietly();
    }

    // -- Charging -------------------------------------------------------

    /**
     * Charges a booking's server-calculated fare to one of the user's saved
     * SumUp cards and, on success, confirms the booking. The amount comes
     * from the stored booking, never from the request.
     *
     * @return bool true if the card was charged successfully
     */
    public function chargeBooking(Booking $booking, string $cardId): bool
    {
        $user = $booking->user;
        $token = $this->ownedToken($user, $cardId);

        $checkout = $this->send(fn () => $this->http()->post('/v0.1/checkouts', [
            'checkout_reference' => "booking-{$booking->id}-".Str::random(12),
            'amount' => round((float) $booking->fare, 2),
            'currency' => strtoupper($booking->currency),
            'merchant_code' => config('services.sumup.merchant_code'),
            'description' => "Taxi booking {$booking->reference}",
            'customer_id' => $this->ensureCustomer($user),
        ]));

        $paid = $this->send(fn () => $this->http()->put('/v0.1/checkouts/'.rawurlencode($checkout['id']), [
            'payment_type' => 'card',
            'customer_id' => $user->sumup_customer_id,
            'token' => $token,
        ]));

        $succeeded = ($paid['status'] ?? null) === 'PAID';

        DB::transaction(function () use ($booking, $checkout, $succeeded) {
            Payment::create([
                'booking_id' => $booking->id,
                'user_id' => $booking->user_id,
                'provider' => 'sumup',
                'sumup_checkout_id' => $checkout['id'],
                'amount' => (int) round(((float) $booking->fare) * 100),
                'currency' => strtolower($booking->currency),
                'payment_method_type' => 'card',
                'status' => $succeeded ? 'succeeded' : 'failed',
            ]);

            if ($succeeded && $booking->status === 'pending_payment') {
                $booking->status = 'confirmed';
                $booking->save();
                app(BookingService::class)->sendConfirmation($booking);
            }
        });

        if (! $succeeded) {
            Log::info('SumUp card charge was not approved', ['booking_id' => $booking->id, 'status' => $paid['status'] ?? null]);
        }

        return $succeeded;
    }

    // -- Internals ------------------------------------------------------

    /**
     * A SumUp customer per user, keyed by our own id so creation is
     * idempotent (SumUp answers 409 if it already exists).
     */
    private function ensureCustomer(User $user): string
    {
        if ($user->sumup_customer_id) {
            return $user->sumup_customer_id;
        }

        $customerId = "daytrip-user-{$user->id}";

        $response = $this->http()->post('/v0.1/customers', [
            'customer_id' => $customerId,
            'personal_details' => [
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
            ],
        ]);

        if (! $response->successful() && $response->status() !== 409) {
            $this->fail($response->status(), $response->body());
        }

        $user->forceFill(['sumup_customer_id' => $customerId])->saveQuietly();

        return $customerId;
    }

    private function tokenFromId(string $cardId): string
    {
        return substr($cardId, strlen(self::ID_PREFIX));
    }

    /**
     * The token behind a "sumup:<token>" id, only if it is genuinely one of
     * this user's saved cards — so one user can't remove or charge another's.
     */
    private function ownedToken(User $user, string $cardId): string
    {
        $token = $this->tokenFromId($cardId);

        $owns = collect($this->listCards($user))->contains(fn ($c) => $c['id'] === self::ID_PREFIX.$token);
        if (! $owns) {
            abort(403, 'You are not authorized to perform this action.');
        }

        return $token;
    }

    private function http(): PendingRequest
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('SumUp is not configured.');
        }

        return Http::baseUrl(config('services.sumup.base_url'))
            ->withToken(config('services.sumup.api_key'))
            ->acceptJson()
            ->asJson()
            ->timeout(20);
    }

    /**
     * Runs a request and returns its decoded JSON, turning any failure into
     * a RuntimeException the controllers translate into a clean 502 (the
     * raw SumUp response is logged, never shown to the customer).
     *
     * @return array<mixed>
     */
    private function send(callable $request): array
    {
        try {
            $response = $request();
        } catch (RequestException $e) {
            $this->fail($e->response->status(), $e->response->body());
        } catch (ConnectionException $e) {
            throw new RuntimeException('Unable to reach SumUp.', 0, $e);
        }

        if (! $response->successful()) {
            $this->fail($response->status(), $response->body());
        }

        return $response->json() ?? [];
    }

    private function fail(int $status, string $body): never
    {
        Log::error('SumUp API request failed', ['status' => $status, 'body' => $body]);

        throw new RuntimeException("SumUp request failed ({$status}).");
    }
}
