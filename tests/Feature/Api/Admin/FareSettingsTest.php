<?php

namespace Tests\Feature\Api\Admin;

use App\Models\User;
use App\Models\VehicleType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FareSettingsTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

    public function test_public_endpoint_returns_default_rates(): void
    {
        $this->getJson('/api/fare-settings')
            ->assertOk()
            ->assertJsonPath('data.baseFare', 7.4)
            ->assertJsonPath('data.perKm', 2.2)
            ->assertJsonPath('data.perPassenger', 1)
            ->assertJsonPath('data.waitingPerMinute', 1)
            ->assertJsonPath('data.maxWaitingMinutes', 60);
    }

    public function test_admin_can_change_rates_and_fares_use_them(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin, 'sanctum')
            ->patchJson('/api/admin/fare-settings', ['base_fare' => 5, 'per_km' => 3, 'per_passenger' => 2, 'waiting_per_minute' => 0.5])
            ->assertOk()
            ->assertJsonPath('data.perKm', 3);

        $this->getJson('/api/fare-settings')->assertJsonPath('data.waitingPerMinute', 0.5);

        // 5 base + 10 km x 3 + 2 passengers x 2 + 30 min x 0.5
        $this->assertSame(54.0, VehicleType::calculateFare(10, 2, 30));
    }

    public function test_non_admins_cannot_change_rates(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->patchJson('/api/admin/fare-settings', ['per_km' => 9])
            ->assertStatus(403);
    }

    public function test_negative_rates_are_rejected(): void
    {
        $this->actingAs($this->makeAdmin(), 'sanctum')
            ->patchJson('/api/admin/fare-settings', ['per_km' => -1])
            ->assertStatus(422)->assertJsonValidationErrors('per_km');
    }
}
