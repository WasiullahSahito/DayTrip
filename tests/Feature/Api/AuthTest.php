<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'firstName' => 'Aoife',
            'lastName' => 'Murphy',
            'email' => 'aoife@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'phone' => '+353 87 123 4567',
            'accountType' => 'personal',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'aoife@example.com')
            ->assertJsonMissingPath('data.user.password')
            ->assertJsonStructure(['data' => ['user', 'token']]);

        $this->assertDatabaseHas('users', ['email' => 'aoife@example.com']);
    }

    public function test_registration_rejects_a_role_field_it_never_asked_for(): void
    {
        // Even if a client sends extra fields (e.g. trying to smuggle a role
        // or account flag), only the whitelisted RegisterRequest fields are
        // ever used to create the user.
        $response = $this->postJson('/api/auth/register', [
            'firstName' => 'Test',
            'lastName' => 'User',
            'email' => 'roletest@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'phone' => '+353 87 000 0000',
            'accountType' => 'personal',
            'role' => 'admin',
            'is_admin' => true,
        ]);

        $response->assertCreated();
        $user = User::where('email', 'roletest@example.com')->first();
        $this->assertNotNull($user);
        // No `role` or `is_admin` column exists at all — the point is that
        // sending them causes no error and grants no privilege.
        $this->assertSame('personal', $user->account_type);
    }

    public function test_duplicate_registration_is_rejected(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->postJson('/api/auth/register', [
            'firstName' => 'Aoife',
            'lastName' => 'Murphy',
            'email' => 'taken@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'phone' => '+353 87 123 4567',
            'accountType' => 'personal',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_invalid_registration_payload_is_rejected(): void
    {
        $response = $this->postJson('/api/auth/register', ['email' => 'not-an-email']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['firstName', 'lastName', 'email', 'password', 'phone', 'accountType']);
    }

    public function test_a_user_can_login_with_correct_credentials(): void
    {
        User::factory()->create(['email' => 'login@example.com', 'password' => 'Password123']);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'login@example.com',
            'password' => 'Password123',
        ]);

        $response->assertOk()->assertJsonStructure(['data' => ['user', 'token']]);
    }

    public function test_login_fails_with_a_generic_message_for_wrong_password(): void
    {
        User::factory()->create(['email' => 'login2@example.com', 'password' => 'Password123']);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'login2@example.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422);
        $message = $response->json('errors.email.0');
        // The message must not reveal whether the account exists.
        $this->assertStringNotContainsString('exist', strtolower($message));
    }

    public function test_login_fails_identically_for_an_unknown_email(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nobody@example.com',
            'password' => 'WhateverPassword1',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_current_user_endpoint_requires_authentication(): void
    {
        $this->getJson('/api/auth/user')->assertStatus(401);
    }

    public function test_current_user_endpoint_returns_the_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/auth/user')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonMissingPath('data.password');
    }

    public function test_logout_revokes_the_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);

        // A guard instance caches its resolved user for its own lifetime
        // (Illuminate\Auth\RequestGuard::user()), which — unlike a real
        // second HTTP request in production, which always gets a fresh
        // guard — persists across calls within one test method. Force a
        // fresh resolution so this assertion reflects the deleted token,
        // not a stale in-memory guard cache.
        auth()->forgetGuards();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/user')
            ->assertStatus(401);
    }

    public function test_profile_update_cannot_change_email_or_account_type(): void
    {
        $user = User::factory()->create(['account_type' => 'personal', 'email' => 'stable@example.com']);

        $this->actingAs($user, 'sanctum')
            ->patchJson('/api/auth/profile', [
                'firstName' => 'Updated',
                'email' => 'changed@example.com',
                'accountType' => 'business',
            ])
            ->assertOk();

        $user->refresh();
        $this->assertSame('Updated', $user->first_name);
        $this->assertSame('stable@example.com', $user->email);
        $this->assertSame('personal', $user->account_type);
    }

    public function test_forgot_password_does_not_reveal_whether_the_email_exists(): void
    {
        Notification::fake();

        User::factory()->create(['email' => 'known@example.com']);

        $knownResponse = $this->postJson('/api/auth/forgot-password', ['email' => 'known@example.com']);
        $unknownResponse = $this->postJson('/api/auth/forgot-password', ['email' => 'unknown@example.com']);

        $knownResponse->assertOk();
        $unknownResponse->assertOk();
        $this->assertSame($knownResponse->json('message'), $unknownResponse->json('message'));
    }

    public function test_password_reset_revokes_existing_tokens(): void
    {
        $user = User::factory()->create(['email' => 'reset@example.com']);
        $token = $user->createToken('test')->plainTextToken;

        $resetToken = \Illuminate\Support\Facades\Password::broker()->createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'token' => $resetToken,
            'email' => 'reset@example.com',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ])->assertOk();

        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword123', $user->password));

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/user')
            ->assertStatus(401);
    }
}
