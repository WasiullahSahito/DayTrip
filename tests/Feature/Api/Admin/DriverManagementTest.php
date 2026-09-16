<?php

namespace Tests\Feature\Api\Admin;

use App\Models\Booking;
use App\Models\Driver;
use App\Models\User;
use App\Models\VehicleType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverManagementTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Seán Byrne',
            'phone' => '+353 87 100 1001',
            'rating' => 4.9,
            'reg' => '141-D-45231',
            'car' => 'Toyota Prius',
            'color' => 'Silver',
        ], $overrides);
    }

    public function test_admin_can_list_drivers(): void
    {
        $admin = $this->makeAdmin();
        Driver::create($this->payload());

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/drivers')
            ->assertOk()
            ->assertJsonPath('data.meta.total', 1);
    }

    public function test_admin_can_create_a_driver(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/drivers', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.reg', '141-D-45231');

        $this->assertDatabaseHas('drivers', ['reg' => '141-D-45231', 'name' => 'Seán Byrne']);
    }

    public function test_duplicate_registration_plate_is_rejected(): void
    {
        $admin = $this->makeAdmin();
        Driver::create($this->payload());

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/drivers', $this->payload(['name' => 'Someone Else']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('reg');
    }

    public function test_admin_can_update_a_driver_including_toggling_active(): void
    {
        $admin = $this->makeAdmin();
        $driver = Driver::create($this->payload());

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/drivers/{$driver->id}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.isActive', false);

        $this->assertDatabaseHas('drivers', ['id' => $driver->id, 'is_active' => false]);
    }

    public function test_deleting_a_driver_preserves_the_snapshot_on_past_bookings(): void
    {
        $admin = $this->makeAdmin();
        $driver = Driver::create($this->payload());

        $vehicleType = VehicleType::create([
            'key' => 'saloon', 'name' => 'Saloon', 'passengers' => 4, 'icon' => 'car',
            'base_fare' => 3.60, 'per_km' => 1.15, 'per_min' => 0.32, 'min_fare' => 6.50, 'eta_mins' => 4,
        ]);

        // reference/user_id/status/fare/driver_id/driver_snapshot are all
        // excluded from Booking::$fillable, so create() would silently drop
        // them — build via `new` + explicit assignment instead, same as
        // BookingService::create() does.
        $booking = new Booking([
            'vehicle_type_id' => $vehicleType->id,
            'pickup' => ['label' => 'A', 'lat' => 53.34, 'lng' => -6.25],
            'destination' => ['label' => 'B', 'lat' => 53.42, 'lng' => -6.24],
            'distance_km' => 10, 'duration_min' => 20, 'currency' => 'EUR',
            'passenger_name' => 'Test Passenger', 'phone' => '+353870000000',
            'payment_method' => 'cash',
        ]);
        $booking->reference = 'LXTEST01';
        $booking->user_id = User::factory()->create()->id;
        $booking->driver_id = $driver->id;
        $booking->driver_snapshot = $driver->toSnapshot();
        $booking->fare = 20;
        $booking->status = 'confirmed';
        $booking->save();

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/drivers/{$driver->id}")
            ->assertOk();

        $booking->refresh();
        $this->assertNull($booking->driver_id);
        $this->assertSame('Seán Byrne', $booking->driver_snapshot['name']);
    }

    public function test_non_admin_gets_403_on_driver_routes(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/admin/drivers', $this->payload())
            ->assertStatus(403);
    }
}
