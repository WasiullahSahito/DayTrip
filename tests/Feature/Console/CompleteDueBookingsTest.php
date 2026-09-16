<?php

namespace Tests\Feature\Console;

use App\Models\Booking;
use App\Models\User;
use App\Models\VehicleType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompleteDueBookingsTest extends TestCase
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

    /**
     * `reference`, `user_id`, `status`, and `fare` are excluded from
     * Booking::$fillable — create() would silently drop them, so they're
     * set individually, same as BookingService::create() does.
     */
    private function makeBooking(array $overrides = []): Booking
    {
        $booking = new Booking(array_merge([
            'vehicle_type_id' => $this->vehicleType->id,
            'pickup' => ['label' => 'A', 'lat' => 53.34, 'lng' => -6.25],
            'destination' => ['label' => 'B', 'lat' => 53.42, 'lng' => -6.24],
            'distance_km' => 10, 'duration_min' => 20, 'currency' => 'EUR',
            'passenger_name' => 'Test Passenger', 'phone' => '+353870000000',
            'payment_method' => 'cash', 'is_scheduled' => false,
        ], array_diff_key($overrides, array_flip(['reference', 'user_id', 'status', 'fare', 'cancelled_at']))));

        $booking->user_id = User::factory()->create()->id;
        $booking->reference = 'LX'.strtoupper(uniqid());
        $booking->status = $overrides['status'] ?? 'confirmed';
        $booking->fare = 20;
        if (isset($overrides['cancelled_at'])) {
            $booking->cancelled_at = $overrides['cancelled_at'];
        }
        $booking->save();

        return $booking;
    }

    public function test_a_confirmed_booking_past_its_duration_is_marked_completed(): void
    {
        $booking = $this->makeBooking();
        $booking->timestamps = false;
        $booking->created_at = now()->subHours(2);
        $booking->save();

        $this->artisan('bookings:complete-due')->assertSuccessful();

        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'completed']);
    }

    public function test_a_confirmed_booking_still_within_its_duration_is_untouched(): void
    {
        $booking = $this->makeBooking();

        $this->artisan('bookings:complete-due')->assertSuccessful();

        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'confirmed']);
    }

    public function test_a_cancelled_booking_past_its_duration_is_untouched(): void
    {
        $booking = $this->makeBooking(['status' => 'cancelled', 'cancelled_at' => now()]);
        $booking->timestamps = false;
        $booking->created_at = now()->subHours(2);
        $booking->save();

        $this->artisan('bookings:complete-due')->assertSuccessful();

        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'cancelled']);
    }
}
