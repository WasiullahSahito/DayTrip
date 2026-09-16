<?php

namespace Tests\Feature\Api\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

    public function test_guest_cannot_access_admin_routes(): void
    {
        $this->getJson('/api/admin/stats')->assertStatus(401);
    }

    public function test_non_admin_user_receives_403(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/stats')
            ->assertStatus(403)
            ->assertJson(['success' => false, 'message' => 'You are not authorized to perform this action.']);
    }

    public function test_admin_user_can_access_admin_routes(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/stats')
            ->assertOk();
    }
}
