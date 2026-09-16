<?php

namespace Tests\Feature\Api\Admin;

use App\Models\Booking;
use App\Models\Driver;
use App\Models\User;
use App\Models\VehicleType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingManagementTest extends TestCase
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

    private function makeAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

    /**
     * `reference`, `user_id`, `status`, `driver_id`, `driver_snapshot`, and
     * `cancelled_at` are deliberately excluded from Booking::$fillable (see
     * the model's docblock) — Booking::create() silently drops them, so
     * they must be set individually, same as BookingService::create() does.
     */
    private function makeBooking(User $user, array $overrides = []): Booking
    {
        $booking = new Booking(array_merge([
            'vehicle_type_id' => $this->vehicleType->id,
            'pickup' => ['label' => 'A', 'lat' => 53.34, 'lng' => -6.25],
            'destination' => ['label' => 'B', 'lat' => 53.42, 'lng' => -6.24],
            'distance_km' => 10, 'duration_min' => 20, 'currency' => 'EUR',
            'passenger_name' => 'Test Passenger', 'phone' => '+353870000000',
            'payment_method' => 'cash',
        ], array_diff_key($overrides, array_flip(['reference', 'user_id', 'status', 'fare', 'driver_id', 'driver_snapshot', 'cancelled_at']))));

        $booking->user_id = $user->id;
        $booking->reference = $overrides['reference'] ?? 'LX'.strtoupper(uniqid());
        $booking->status = $overrides['status'] ?? 'confirmed';
        $booking->fare = $overrides['fare'] ?? 20;
        $booking->save();

        return $booking;
    }

    public function test_admin_sees_bookings_across_every_user(): void
    {
        $admin = $this->makeAdmin();
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $this->makeBooking($userA);
        $this->makeBooking($userB);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/bookings');

        $response->assertOk();
        $this->assertCount(2, $response->json('data.data'));
    }

    public function test_admin_status_update_bypasses_customer_cancellable_rules(): void
    {
        $admin = $this->makeAdmin();
        $user = User::factory()->create();
        $booking = $this->makeBooking($user, ['status' => 'pending_payment']);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/bookings/{$booking->id}/status", ['status' => 'completed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'completed']);
    }

    public function test_admin_can_assign_a_driver_to_a_booking(): void
    {
        $admin = $this->makeAdmin();
        $user = User::factory()->create();
        $booking = $this->makeBooking($user);
        $driver = Driver::create([
            'name' => 'Aisling Kelly', 'phone' => '+353871001002', 'rating' => 4.8,
            'reg' => '192-D-11823', 'car' => 'Skoda Octavia', 'color' => 'Black',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/bookings/{$booking->id}/assign-driver", ['driverId' => $driver->id]);

        $response->assertOk()->assertJsonPath('data.driverId', $driver->id);

        $booking->refresh();
        $this->assertSame($driver->id, $booking->driver_id);
        $this->assertSame($driver->toSnapshot(), $booking->driver_snapshot);
    }

    public function test_non_admin_gets_403_on_booking_management_routes(): void
    {
        $user = User::factory()->create();
        $booking = $this->makeBooking($user);

        $this->actingAs($user, 'sanctum')
            ->patchJson("/api/admin/bookings/{$booking->id}/status", ['status' => 'completed'])
            ->assertStatus(403);
    }
}
