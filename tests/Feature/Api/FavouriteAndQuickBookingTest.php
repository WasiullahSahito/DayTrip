<?php

namespace Tests\Feature\Api;

use App\Models\FavouriteAddress;
use App\Models\QuickBooking;
use App\Models\User;
use App\Models\VehicleType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FavouriteAndQuickBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_manage_their_own_favourites(): void
    {
        $user = User::factory()->create();

        $create = $this->actingAs($user, 'sanctum')->postJson('/api/favourites', [
            'nickname' => 'Home', 'label' => 'Trinity College Dublin', 'lat' => 53.3438, 'lng' => -6.2546,
        ]);
        $create->assertCreated();

        $id = FavouriteAddress::first()->id;

        $this->actingAs($user, 'sanctum')->deleteJson("/api/favourites/{$id}")->assertOk();
        $this->assertDatabaseCount('favourite_addresses', 0);
    }

    public function test_a_user_cannot_delete_another_users_favourite(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();

        $favourite = $owner->favouriteAddresses()->create([
            'nickname' => 'Home', 'label' => 'Trinity College Dublin', 'lat' => 53.3438, 'lng' => -6.2546,
        ]);

        $this->actingAs($attacker, 'sanctum')
            ->deleteJson("/api/favourites/{$favourite->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('favourite_addresses', ['id' => $favourite->id]);
    }

    public function test_a_user_cannot_delete_another_users_quick_booking(): void
    {
        $vehicleType = VehicleType::create([
            'key' => 'saloon', 'name' => 'Saloon', 'passengers' => 4, 'icon' => 'car',
            'base_fare' => 3.60, 'per_km' => 1.15, 'per_min' => 0.32, 'min_fare' => 6.50, 'eta_mins' => 4,
        ]);
        $owner = User::factory()->create();
        $attacker = User::factory()->create();

        $quickBooking = $owner->quickBookings()->create([
            'vehicle_type_id' => $vehicleType->id,
            'label' => 'Commute',
            'pickup' => ['label' => 'A', 'lat' => 53.34, 'lng' => -6.25],
            'destination' => ['label' => 'B', 'lat' => 53.42, 'lng' => -6.24],
        ]);

        $this->actingAs($attacker, 'sanctum')
            ->deleteJson("/api/quick-bookings/{$quickBooking->id}")
            ->assertStatus(403);
    }
}
