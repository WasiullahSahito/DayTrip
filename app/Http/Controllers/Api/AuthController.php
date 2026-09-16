<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponses;

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'email' => $data['email'],
            'password' => $data['password'],
            'phone' => $data['phone'],
            'account_type' => $data['accountType'],
            'business_name' => $data['businessName'] ?? null,
        ]);

        event(new Registered($user));

        $token = $user->createToken('spa')->plainTextToken;

        return $this->created([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Account created successfully.');
    }

    /**
     * Deliberately generic on failure — never reveals whether the email
     * exists, and rate-limited via the `login` limiter (keyed by IP+email)
     * to slow brute force without letting one IP lock out every account.
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (! Auth::once($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Incorrect email or password. Please try again.'],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('spa')->plainTextToken;

        return $this->ok([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Logged in successfully.');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->ok(null, 'Logged out successfully.');
    }

    public function user(Request $request)
    {
        return $this->ok(new UserResource($request->user()));
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        $user->update([
            'first_name' => $data['firstName'] ?? $user->first_name,
            'last_name' => $data['lastName'] ?? $user->last_name,
            'phone' => $data['phone'] ?? $user->phone,
        ]);

        return $this->ok(new UserResource($user), 'Profile updated.');
    }

    /**
     * Always returns success, whether or not the email exists — this is
     * what prevents account enumeration through this endpoint.
     */
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        Password::sendResetLink($request->only('email'));

        return $this->ok(null, 'If an account exists for that email, a reset link has been sent.');
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $status = Password::reset(
            $request->validated(),
            function (User $user, string $password) {
                $user->forceFill(['password' => $password])->setRememberToken(Str::random(60));
                $user->save();
                // Revoke every existing session — a leaked-then-reset password
                // shouldn't leave old tokens usable.
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return $this->ok(null, 'Password reset successfully.');
    }
}
