<?php

namespace Tests\Feature\Api\Admin;

use App\Models\User;
use App\Models\VehicleType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleTypeManagementTest extends TestCase
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
            'key' => 'luxury',
            'name' => 'Luxury Saloon',
            'passengers' => 4,
            'base_fare' => 6.00,
            'per_km' => 1.80,
            'per_min' => 0.45,
            'min_fare' => 10.00,
        ], $overrides);
    }

    public function test_admin_can_list_vehicle_types_including_inactive_ones(): void
    {
        $admin = $this->makeAdmin();
        VehicleType::create(array_merge($this->payload(), ['is_active' => false]));

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/vehicle-types');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertFalse($response->json('data.0.isActive'));
    }

    public function test_admin_can_create_a_vehicle_type(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/vehicle-types', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.key', 'luxury')
            ->assertJsonPath('data.baseFare', 6);

        $this->assertDatabaseHas('vehicle_types', ['key' => 'luxury', 'name' => 'Luxury Saloon']);
    }

    /**
     * eta_mins/is_active have DB-level defaults and are optional in the
     * request — the response must reflect what Postgres actually stored,
     * not leave them null just because the client omitted them.
     */
    public function test_omitted_optional_fields_reflect_database_defaults_not_null(): void
    {
        $admin = $this->makeAdmin();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/vehicle-types', $this->payload());

        $response->assertCreated();
        $this->assertNotNull($response->json('data.etaMins'));
        $this->assertTrue($response->json('data.isActive'));
    }

    public function test_duplicate_key_is_rejected(): void
    {
        $admin = $this->makeAdmin();
        VehicleType::create($this->payload());

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/vehicle-types', $this->payload(['name' => 'Something Else']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('key');
    }

    public function test_admin_can_update_rates_and_deactivate(): void
    {
        $admin = $this->makeAdmin();
        $vehicleType = VehicleType::create($this->payload());

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/vehicle-types/{$vehicleType->id}", ['base_fare' => 8.50, 'is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.baseFare', 8.5)
            ->assertJsonPath('data.isActive', false);
    }

    public function test_deactivated_vehicle_type_is_hidden_from_the_public_endpoint(): void
    {
        $vehicleType = VehicleType::create($this->payload(['is_active' => false]));

        $response = $this->getJson('/api/vehicle-types');

        $response->assertOk();
        $this->assertFalse(collect($response->json('data'))->contains('id', $vehicleType->key));
    }

    public function test_non_admin_gets_403_on_vehicle_type_routes(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/admin/vehicle-types', $this->payload())
            ->assertStatus(403);
    }
}
