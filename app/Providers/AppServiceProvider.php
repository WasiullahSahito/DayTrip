<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Stripe\StripeClient;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bound as a singleton and injected wherever needed (PaymentService)
        // rather than constructed inline, so tests can swap in a mock
        // without ever calling Stripe's real API.
        //
        // StripeClient's constructor validates the key eagerly and throws on
        // an empty string — which would 500 *every* endpoint that injects
        // PaymentService (even cash-only paths that never touch Stripe,
        // like listing an empty payment-methods array) whenever STRIPE_SECRET
        // isn't configured yet. A placeholder keeps construction safe; any
        // code path that actually calls Stripe still fails, correctly, with
        // a real ApiErrorException that the controllers already translate
        // into a clean error response.
        $this->app->singleton(
            StripeClient::class,
            fn () => new StripeClient(config('services.stripe.secret') ?: 'sk_test_not_configured')
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerRateLimiters();
        $this->registerPasswordResetUrl();
    }

    /**
     * Named limiters for sensitive endpoints, applied per-route via
     * throttle:<name> — tighter than the general `api` limiter, and keyed
     * by IP (pre-auth endpoints) or by user (post-auth) to prevent both
     * brute force from one IP and abuse from one account.
     */
    private function registerRateLimiters(): void
    {
        // General baseline for every API route (append:'throttle:api' in
        // bootstrap/app.php) — the named limiters below are stricter
        // overrides for specific sensitive endpoints.
        RateLimiter::for('api', fn ($request) => Limit::perMinute(60)->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('login', fn ($request) => Limit::perMinute(5)->by($request->ip().'|'.$request->input('email')));

        RateLimiter::for('register', fn ($request) => Limit::perMinute(5)->by($request->ip()));

        RateLimiter::for('password-reset', fn ($request) => Limit::perMinute(3)->by($request->ip().'|'.$request->input('email')));

        RateLimiter::for('booking-create', fn ($request) => Limit::perMinute(10)->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('payment-intent', fn ($request) => Limit::perMinute(10)->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('contact', fn ($request) => Limit::perMinute(5)->by($request->ip()));

        RateLimiter::for('stripe-webhook', fn ($request) => Limit::perMinute(120)->by($request->ip()));
    }

    /**
     * The frontend is a separate SPA — there's no server-rendered page for
     * Laravel's default password-reset notification to link to, so point
     * it at the SPA's own /reset-password route instead. The token is still
     * exactly what the password broker generated: single-use and expiring
     * per config/auth.php's `passwords.users.expire`.
     */
    private function registerPasswordResetUrl(): void
    {
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontendUrl = rtrim(config('services.frontend.url'), '/');

            return "{$frontendUrl}/reset-password?token={$token}&email=".urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
