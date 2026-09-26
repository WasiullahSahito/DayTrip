<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\User;
use App\Models\VehicleType;
use App\Notifications\BookingConfirmed;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class SumUpTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.sumup.api_key' => 'sup_sk_test', 'services.sumup.merchant_code' => 'MTEST123']);

        VehicleType::create([
            'key' => 'saloon', 'name' => 'Saloon', 'passengers' => 4, 'icon' => 'car',
            'base_fare' => 0, 'per_km' => 0, 'per_min' => 0, 'min_fare' => 0, 'eta_mins' => 4,
        ]);
    }

    private function instrument(string $token = 'tok_abc'): array
    {
        return ['token' => $token, 'active' => true, 'type' => 'card', 'card' => ['last_4_digits' => '4242', 'type' => 'VISA']];
    }

    /**
     * @param  array<string, mixed>  $checkout  what GET/PUT on an existing checkout returns
     */
    private function fakeSumUp(array $checkout = [], array $instruments = []): void
    {
        Http::fake([
            'api.sumup.com/v0.1/customers' => Http::response(['customer_id' => 'x'], 201),
            'api.sumup.com/v0.1/customers/*/payment-instruments' => Http::response($instruments ?: [$this->instrument()]),
            'api.sumup.com/v0.1/customers/*/payment-instruments/*' => Http::response('', 204),
            'api.sumup.com/v0.1/checkouts' => Http::response(['id' => 'co_1'], 201),
            'api.sumup.com/v0.1/checkouts/co_1' => Http::response($checkout + ['id' => 'co_1', 'status' => 'PAID']),
        ]);
    }

    private function userWithSumUpCustomer(): User
    {
        $user = User::factory()->create();
        $user->forceFill(['sumup_customer_id' => "daytrip-user-{$user->id}"])->saveQuietly();

        return $user;
    }

    private function cardBooking(User $user): Booking
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

    public function test_setup_checkout_is_created_for_a_sumup_customer(): void
    {
        $this->fakeSumUp();
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')->postJson('/api/payment-methods/sumup/checkout')
            ->assertOk()
            ->assertJsonPath('data.checkoutId', 'co_1');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'sumup_customer_id' => "daytrip-user-{$user->id}"]);

        Http::assertSent(fn (Request $r) => $r->method() === 'POST'
            && str_ends_with($r->url(), '/v0.1/checkouts')
            && $r['purpose'] === 'SETUP_RECURRING_PAYMENT'
            && $r['merchant_code'] === 'MTEST123'
            && $r['customer_id'] === "daytrip-user-{$user->id}");
    }

    public function test_sumup_is_reported_as_unconfigured_without_credentials(): void
    {
        config(['services.sumup.api_key' => null]);
        Http::fake();

        $this->actingAs(User::factory()->create(), 'sanctum')->postJson('/api/payment-methods/sumup/checkout')
            ->assertStatus(503);

        Http::assertNothingSent();
    }

    public function test_confirming_a_paid_setup_checkout_saves_the_card_as_default(): void
    {
        $user = $this->userWithSumUpCustomer();
        $this->fakeSumUp(['checkout_reference' => "setup-{$user->id}-abc123"]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/payment-methods/sumup/confirm', ['checkoutId' => 'co_1']);

        $response->assertCreated()
            ->assertJsonPath('data.0.id', 'sumup:tok_abc')
            ->assertJsonPath('data.0.provider', 'sumup')
            ->assertJsonPath('data.0.brand', 'Visa')
            ->assertJsonPath('data.0.last4', '4242')
            ->assertJsonPath('data.0.isDefault', true);
    }

    public function test_an_unpaid_setup_checkout_does_not_save_a_card(): void
    {
        $user = $this->userWithSumUpCustomer();
        $this->fakeSumUp(['checkout_reference' => "setup-{$user->id}-abc123", 'status' => 'PENDING']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/payment-methods/sumup/confirm', ['checkoutId' => 'co_1'])
            ->assertStatus(502);
    }

    public function test_a_user_cannot_claim_another_users_setup_checkout(): void
    {
        $owner = $this->userWithSumUpCustomer();
        $attacker = $this->userWithSumUpCustomer();
        $this->fakeSumUp(['checkout_reference' => "setup-{$owner->id}-abc123"]);

        $this->actingAs($attacker, 'sanctum')
            ->postJson('/api/payment-methods/sumup/confirm', ['checkoutId' => 'co_1'])
            ->assertStatus(403);
    }

    public function test_saved_sumup_cards_appear_in_the_card_list_and_can_be_removed(): void
    {
        $this->fakeSumUp();
        $user = $this->userWithSumUpCustomer();

        $this->actingAs($user, 'sanctum')->getJson('/api/payment-methods')
            ->assertOk()
            ->assertJsonPath('data.0.id', 'sumup:tok_abc');

        $this->actingAs($user, 'sanctum')->deleteJson('/api/payment-methods/sumup:tok_abc')->assertOk();

        Http::assertSent(fn (Request $r) => $r->method() === 'DELETE' && str_contains($r->url(), '/payment-instruments/tok_abc'));
    }

    public function test_a_user_cannot_remove_a_card_they_do_not_own(): void
    {
        $this->fakeSumUp();
        $user = $this->userWithSumUpCustomer();

        $this->actingAs($user, 'sanctum')->deleteJson('/api/payment-methods/sumup:someone_elses')->assertStatus(403);

        Http::assertNotSent(fn (Request $r) => $r->method() === 'DELETE');
    }

    public function test_a_booking_can_be_paid_with_a_saved_sumup_card(): void
    {
        Notification::fake();
        $this->fakeSumUp();
        $user = $this->userWithSumUpCustomer();
        $booking = $this->cardBooking($user);
        $this->assertSame('pending_payment', $booking->status);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/payments/sumup/charge', ['bookingId' => $booking->id, 'cardId' => 'sumup:tok_abc'])
            ->assertOk()
            ->assertJsonPath('data.status', 'succeeded');

        $this->assertSame('confirmed', $booking->fresh()->status);
        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id, 'provider' => 'sumup', 'sumup_checkout_id' => 'co_1',
            'status' => 'succeeded', 'amount' => (int) round(((float) $booking->fare) * 100),
        ]);
        Notification::assertSentTo($user, BookingConfirmed::class);

        // The amount charged is the stored fare, sent as a decimal in EUR.
        Http::assertSent(fn (Request $r) => $r->method() === 'POST'
            && str_ends_with($r->url(), '/v0.1/checkouts')
            && ($r['purpose'] ?? null) === null
            && abs($r['amount'] - (float) $booking->fare) < 0.001
            && $r['currency'] === 'EUR');
    }

    public function test_a_declined_sumup_charge_leaves_the_booking_pending(): void
    {
        Notification::fake();
        $this->fakeSumUp(['status' => 'FAILED']);
        $user = $this->userWithSumUpCustomer();
        $booking = $this->cardBooking($user);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/payments/sumup/charge', ['bookingId' => $booking->id, 'cardId' => 'sumup:tok_abc'])
            ->assertStatus(402);

        $this->assertSame('pending_payment', $booking->fresh()->status);
        $this->assertDatabaseHas('payments', ['booking_id' => $booking->id, 'status' => 'failed']);
    }

    public function test_a_user_cannot_pay_for_someone_elses_booking(): void
    {
        Notification::fake();
        $this->fakeSumUp();
        $owner = $this->userWithSumUpCustomer();
        $attacker = $this->userWithSumUpCustomer();
        $booking = $this->cardBooking($owner);

        $this->actingAs($attacker, 'sanctum')
            ->postJson('/api/payments/sumup/charge', ['bookingId' => $booking->id, 'cardId' => 'sumup:tok_abc'])
            ->assertStatus(403);

        $this->assertSame('pending_payment', $booking->fresh()->status);
    }

    public function test_charging_a_card_id_that_is_not_a_sumup_id_is_rejected(): void
    {
        $user = $this->userWithSumUpCustomer();
        $booking = $this->cardBooking($user);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/payments/sumup/charge', ['bookingId' => $booking->id, 'cardId' => 'pm_123'])
            ->assertStatus(422);
    }
}
