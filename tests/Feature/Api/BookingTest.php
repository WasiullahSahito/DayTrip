<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\User;
use App\Models\VehicleType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    private VehicleType $vehicleType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vehicleType = VehicleType::create([
            'key' => 'saloon',
            'name' => 'Saloon',
            'passengers' => 4,
            'icon' => 'car',
            'base_fare' => 3.60,
            'per_km' => 1.15,
            'per_min' => 0.32,
            'min_fare' => 6.50,
            'eta_mins' => 4,
        ]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'pickup' => ['label' => 'Trinity College Dublin', 'lat' => 53.3438, 'lng' => -6.2546],
            'destination' => ['label' => 'Dublin Airport', 'lat' => 53.4264, 'lng' => -6.2499],
            'vehicleTypeId' => 'saloon',
            'passengerName' => 'Aoife Murphy',
            'phone' => '+353 87 123 4567',
            'paymentMethod' => ['type' => 'cash'],
        ], $overrides);
    }

    public function test_booking_creation_requires_authentication(): void
    {
        $this->postJson('/api/bookings', $this->payload())->assertStatus(401);
    }

    public function test_a_user_can_create_a_booking(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/bookings', $this->payload());

        $response->assertCreated()
            ->assertJsonPath('data.passengerName', 'Aoife Murphy')
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.paymentMethod.type', 'cash');

        $this->assertDatabaseHas('bookings', ['user_id' => $user->id, 'passenger_name' => 'Aoife Murphy']);

        Notification::assertSentTo($user, \App\Notifications\BookingConfirmed::class);
    }

    /**
     * The single most important booking test: whatever fare/distance/status
     * a client sends is completely ignored in favour of the server's own
     * calculation from vehicle-type rates and coordinates.
     */
    public function test_client_supplied_fare_and_status_are_ignored(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/bookings', $this->payload([
            'fare' => 1.00,
            'distanceKm' => 0.1,
            'durationMin' => 1,
            'status' => 'completed',
        ]));

        $response->assertCreated();

        $booking = Booking::first();
        // Trinity -> Dublin Airport is a real ~11km route; the server-calculated
        // fare must reflect that, not the attacker-supplied €1.00 / 0.1km.
        $this->assertGreaterThan(5.0, (float) $booking->distance_km);
        $this->assertGreaterThan(1.00, (float) $booking->fare);
        $this->assertSame('confirmed', $booking->status); // not "completed"
    }

    public function test_a_user_cannot_view_another_users_booking(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();

        $booking = $this->actingAs($owner, 'sanctum')
            ->postJson('/api/bookings', $this->payload())
            ->json('data');

        $this->actingAs($attacker, 'sanctum')
            ->getJson("/api/bookings/{$booking['id']}")
            ->assertStatus(403);
    }

    public function test_a_user_cannot_cancel_another_users_booking(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();

        $booking = $this->actingAs($owner, 'sanctum')
            ->postJson('/api/bookings', $this->payload())
            ->json('data');

        $this->actingAs($attacker, 'sanctum')
            ->postJson("/api/bookings/{$booking['id']}/cancel")
            ->assertStatus(403);

        $this->assertDatabaseHas('bookings', ['id' => $booking['id'], 'status' => 'confirmed']);
    }

    public function test_a_user_can_cancel_their_own_booking(): void
    {
        $user = User::factory()->create();

        $booking = $this->actingAs($user, 'sanctum')
            ->postJson('/api/bookings', $this->payload())
            ->json('data');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/bookings/{$booking['id']}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.cancelled', true);
    }

    public function test_a_users_booking_list_never_includes_another_users_bookings(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $this->actingAs($userA, 'sanctum')->postJson('/api/bookings', $this->payload());
        $this->actingAs($userB, 'sanctum')->postJson('/api/bookings', $this->payload());

        $response = $this->actingAs($userA, 'sanctum')->getJson('/api/bookings');

        $response->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id');
        $this->assertCount(1, $ids);

        $bookingB = Booking::where('user_id', $userB->id)->first();
        $this->assertFalse($ids->contains((string) $bookingB->id));
    }

    public function test_duplicate_submission_with_the_same_idempotency_key_does_not_create_two_bookings(): void
    {
        $user = User::factory()->create();
        $key = (string) \Illuminate\Support\Str::uuid();

        $first = $this->actingAs($user, 'sanctum')
            ->withHeader('Idempotency-Key', $key)
            ->postJson('/api/bookings', $this->payload());

        $second = $this->actingAs($user, 'sanctum')
            ->withHeader('Idempotency-Key', $key)
            ->postJson('/api/bookings', $this->payload());

        $first->assertCreated();
        $second->assertCreated();
        $this->assertSame($first->json('data.id'), $second->json('data.id'));
        $this->assertSame(1, Booking::count());
    }

    public function test_an_invalid_vehicle_type_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/bookings', $this->payload(['vehicleTypeId' => 'helicopter']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('vehicleTypeId');
    }

    public function test_an_already_cancelled_booking_cannot_be_cancelled_again(): void
    {
        $user = User::factory()->create();

        $booking = $this->actingAs($user, 'sanctum')
            ->postJson('/api/bookings', $this->payload())
            ->json('data');

        $this->actingAs($user, 'sanctum')->postJson("/api/bookings/{$booking['id']}/cancel")->assertOk();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/bookings/{$booking['id']}/cancel")
            ->assertStatus(403);
    }
}
