<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use App\Models\VehicleType;
use App\Notifications\BookingConfirmed;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Mockery;
use Mockery\MockInterface;
use Stripe\StripeClient;
use Stripe\Util\Util;
use Stripe\WebhookSignature;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    private VehicleType $vehicleType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vehicleType = VehicleType::create([
            'key' => 'saloon', 'name' => 'Saloon', 'passengers' => 4, 'icon' => 'car',
            'base_fare' => 3.60, 'per_km' => 1.15, 'per_min' => 0.32, 'min_fare' => 6.50, 'eta_mins' => 4,
        ]);
    }

    private function createCardBooking(User $user): Booking
    {
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/bookings', [
            'pickup' => ['label' => 'Trinity College Dublin', 'lat' => 53.3438, 'lng' => -6.2546],
            'destination' => ['label' => 'Dublin Airport', 'lat' => 53.4264, 'lng' => -6.2499],
            'vehicleTypeId' => 'saloon',
            'passengerName' => 'Aoife Murphy',
            'phone' => '+353 87 123 4567',
            'paymentMethod' => ['type' => 'card'],
        ]);

        return Booking::findOrFail($response->json('data.id'));
    }

    public function test_payment_intent_requires_authentication(): void
    {
        $this->postJson('/api/payments/intents', ['bookingId' => 1])->assertStatus(401);
    }

    public function test_a_user_cannot_create_a_payment_intent_for_another_users_booking(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $booking = $this->createCardBooking($owner);

        $this->actingAs($attacker, 'sanctum')
            ->postJson('/api/payments/intents', ['bookingId' => $booking->id])
            ->assertStatus(403);

        $this->assertDatabaseMissing('payments', ['booking_id' => $booking->id]);
    }

    public function test_a_cash_booking_cannot_be_paid_by_card(): void
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/bookings', [
            'pickup' => ['label' => 'A', 'lat' => 53.34, 'lng' => -6.25],
            'destination' => ['label' => 'B', 'lat' => 53.42, 'lng' => -6.24],
            'vehicleTypeId' => 'saloon',
            'passengerName' => 'X', 'phone' => '+353 87 000 0000',
            'paymentMethod' => ['type' => 'cash'],
        ]);
        $bookingId = $response->json('data.id');

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/payments/intents', ['bookingId' => $bookingId])
            ->assertStatus(403);
    }

    /**
     * The request body only ever contains `bookingId` — this asserts the
     * amount actually sent to Stripe is the server-calculated fare in cents,
     * proving there is no path for a client to influence the charge amount.
     */
    public function test_payment_intent_amount_is_the_servers_calculated_fare_not_client_input(): void
    {
        $user = User::factory()->create();
        $booking = $this->createCardBooking($user);
        $expectedAmount = (int) round(((float) $booking->fare) * 100);

        $this->mockStripePaymentIntentCreate(function (array $params) use ($expectedAmount, $booking) {
            $this->assertSame($expectedAmount, $params['amount']);
            $this->assertSame((string) $booking->id, (string) $params['metadata']['booking_id']);
        });

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/payments/intents', ['bookingId' => $booking->id]);

        $response->assertOk()->assertJsonStructure(['data' => ['clientSecret', 'payment']]);
        $this->assertDatabaseHas('payments', ['booking_id' => $booking->id, 'amount' => $expectedAmount]);
    }

    public function test_webhook_rejects_an_invalid_signature(): void
    {
        $response = $this->call('POST', '/api/stripe/webhook', [], [], [], [
            'HTTP_Stripe-Signature' => 't=1,v1=invalid',
        ], json_encode(['type' => 'payment_intent.succeeded']));

        $response->assertStatus(400);
    }

    public function test_webhook_confirms_booking_and_sends_email_on_payment_success(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $booking = $this->createCardBooking($user);
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'stripe_payment_intent_id' => 'pi_test_123',
            'amount' => (int) round(((float) $booking->fare) * 100),
            'currency' => 'eur',
            'status' => 'requires_payment_method',
        ]);

        $payload = json_encode([
            'id' => 'evt_test_1',
            'type' => 'payment_intent.succeeded',
            'data' => ['object' => ['id' => 'pi_test_123', 'object' => 'payment_intent', 'payment_method_types' => ['card']]],
        ]);

        $this->postSignedWebhook($payload)->assertOk();

        $payment->refresh();
        $booking->refresh();
        $this->assertSame('succeeded', $payment->status);
        $this->assertSame('confirmed', $booking->status);
        Notification::assertSentTo($user, BookingConfirmed::class);
    }

    public function test_webhook_does_not_process_the_same_event_twice(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $booking = $this->createCardBooking($user);
        Payment::create([
            'booking_id' => $booking->id, 'user_id' => $user->id,
            'stripe_payment_intent_id' => 'pi_test_456', 'amount' => 1000,
            'currency' => 'eur', 'status' => 'requires_payment_method',
        ]);

        $payload = json_encode([
            'id' => 'evt_test_dup',
            'type' => 'payment_intent.succeeded',
            'data' => ['object' => ['id' => 'pi_test_456', 'object' => 'payment_intent', 'payment_method_types' => ['card']]],
        ]);

        $this->postSignedWebhook($payload)->assertOk();
        $this->postSignedWebhook($payload)->assertOk();

        Notification::assertSentToTimes($user, BookingConfirmed::class, 1);
        $this->assertSame(1, \App\Models\StripeWebhookEvent::where('stripe_event_id', 'evt_test_dup')->count());
    }

    public function test_webhook_failed_payment_does_not_confirm_the_booking(): void
    {
        $user = User::factory()->create();
        $booking = $this->createCardBooking($user);
        Payment::create([
            'booking_id' => $booking->id, 'user_id' => $user->id,
            'stripe_payment_intent_id' => 'pi_test_789', 'amount' => 1000,
            'currency' => 'eur', 'status' => 'requires_payment_method',
        ]);

        $payload = json_encode([
            'id' => 'evt_test_failed',
            'type' => 'payment_intent.payment_failed',
            'data' => ['object' => ['id' => 'pi_test_789', 'object' => 'payment_intent', 'payment_method_types' => ['card']]],
        ]);

        $this->postSignedWebhook($payload)->assertOk();

        $booking->refresh();
        $this->assertSame('pending_payment', $booking->status);
        $this->assertSame('failed', Payment::where('stripe_payment_intent_id', 'pi_test_789')->first()->status);
    }

    private function postSignedWebhook(string $payload)
    {
        $header = WebhookSignature::generateSignatureHeader($payload, config('services.stripe.webhook_secret'));

        return $this->call('POST', '/api/stripe/webhook', [], [], [], [
            'HTTP_Stripe-Signature' => $header,
            'CONTENT_TYPE' => 'application/json',
        ], $payload);
    }

    private function mockStripePaymentIntentCreate(\Closure $assertParams): void
    {
        $fakeIntent = Util::convertToStripeObject([
            'id' => 'pi_fake_1',
            'client_secret' => 'pi_fake_1_secret_abc',
            'status' => 'requires_payment_method',
            'object' => 'payment_intent',
        ], []);

        $paymentIntentsService = Mockery::mock();
        $paymentIntentsService->shouldReceive('create')
            ->once()
            ->with(Mockery::on(function ($params) use ($assertParams) {
                $assertParams($params);

                return true;
            }))
            ->andReturn($fakeIntent);

        $customersService = Mockery::mock();
        $customersService->shouldReceive('create')->andReturn(Util::convertToStripeObject(['id' => 'cus_fake_1'], []));

        $this->mock(StripeClient::class, function (MockInterface $mock) use ($paymentIntentsService, $customersService) {
            // StripeClient's real __get() delegates to getService() — Mockery
            // doesn't reliably intercept a magic method the parent class
            // already defines, so stub the method PHP actually dispatches to.
            $mock->shouldReceive('getService')->with('paymentIntents')->andReturn($paymentIntentsService);
            $mock->shouldReceive('getService')->with('customers')->andReturn($customersService);
        });
    }
}
