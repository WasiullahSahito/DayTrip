# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Daytrip (formerly "Lynk" — some identifiers still say `lynk`, e.g. the `lynk:auth-expired` window event, the `lynk-clone:token:v2` localStorage key, `APP_NAME=Lynk` in `.env.example`) is a taxi-booking platform: a **Laravel 13 JSON API** (repo root) plus a **separate React 19 SPA** (`frontend/`). See `README.md` for the feature list.

The two halves are deployed independently and talk only over HTTP: the SPA calls `VITE_API_URL` (default `http://localhost:8000/api`) with a Sanctum bearer token. Laravel's `routes/web.php` still returns the default `welcome` view; it does not serve the SPA.

Root `package.json`/`vite.config.js` (Laravel's `laravel-vite-plugin` pipeline, `resources/js/app.js`) and `frontend/package.json` are unrelated toolchains with separate `node_modules`. Product work almost always belongs in `frontend/`.

## Commands

### Backend (repo root)

- Setup: `composer run setup` (installs deps, copies `.env`, generates key, migrates, builds root assets)
- Dev stack: `composer run dev` (runs `php artisan dev`)
- Tests: `composer run test`; single test: `php artisan test --filter=TestNameOrClass`
- Format: `vendor/bin/pint`
- Scheduled job: `php artisan bookings:complete-due` (also scheduled every 5 min in `routes/console.php`; needs `schedule:work`/cron to run)
- Seed: `php artisan db:seed` (vehicle types and drivers)

Tests (`phpunit.xml`) use in-memory SQLite, so no external services are needed. **The real app requires PostgreSQL** (`DB_CONNECTION=pgsql` in `.env.example`); don't assume SQLite locally. Stripe is bound as a mockable singleton, so tests never call Stripe.

### Frontend (`cd frontend`)

- `npm install`, `npm run dev`, `npm run build`, `npm run lint` (no test runner is configured)
- Env (`frontend/.env.example`): `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_GOOGLE_MAPS_API_KEY`. Without a Maps key the app falls back to a mock Dublin address book.

## Backend architecture

- `routes/api.php` has three tiers: public (auth, vehicle types, fare quote, contact/demo, Stripe webhook), `auth:sanctum` (bookings, favourites, quick bookings, payments, payment methods), and `/admin/*` (`auth:sanctum` + `admin` middleware, alias for `EnsureUserIsAdmin`, based on `users.is_admin`).
- Layering: thin controllers in `Http/Controllers/Api` → Form Requests for validation → `Services/BookingService` and `Services/PaymentService` for logic → API Resources for output. Access control lives in `Policies/`.
- **Response envelope**: every response is `{success, message, data|errors}`. Controllers use the `ApiResponses` trait (`ok`/`created`/`fail`). `ApiExceptionRenderer` (registered in `bootstrap/app.php`) converts all exceptions for `api/*` into this envelope and never leaks traces or SQL, regardless of `APP_DEBUG`. The frontend depends on this shape.
- **Server-authoritative pricing**: `BookingService` recomputes distance and fare from coordinates and the request. Fare = `7.40 base + 2.20 x km + 1 x passengers + 1 per waiting minute`, with waiting capped at one hour (formula in `VehicleType::calculateFare`; rates are admin-editable at `/admin/fare-settings`, stored in the `settings` table via `FareSettings`, with `config/fare.php` as defaults). It does not use the per-vehicle rate columns. `BookingRequest` rejects a passenger count above the vehicle's seats and names the smallest vehicle that fits. Clients can't set `fare`, `distance`, `status`, etc. — those are deliberately excluded from `Booking::$fillable`, so `update(['status' => ...])` silently no-ops. Set `$booking->status = ...` directly, as `BookingService` and `CompleteDueBookings` do. The fare formula has a frontend copy (`estimateFare` in `frontend/src/data/vehicles.js`) for live previews; keep the two in sync. The frontend loads the live rates from the public `GET /api/fare-settings` via `useFareSettings()`.
- **Payment flow**: cash bookings are `confirmed` immediately; card bookings start `pending_payment`. `PaymentService` creates the PaymentIntent from the *stored* fare. `StripeWebhookController` verifies the signature, records event IDs in `stripe_webhook_events` for idempotency, and moves payment/booking state. Booking creation accepts an `Idempotency-Key` header.
- **SumUp (second card provider)**: `SumUpService` saves cards (a `SETUP_RECURRING_PAYMENT` checkout mounted in SumUp's Card Widget, then re-verified server-side) and charges saved ones synchronously (`POST /payments/sumup/charge`, no webhook). Config: `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE`, `SUMUP_SETUP_AMOUNT`. `PaymentMethodController` merges Stripe and SumUp cards into one list; SumUp ids are `sumup:<token>`, and `users.default_card_provider` decides the single default. Tests fake SumUp with `Http::fake` (unmatched requests would hit the real API).
- Rate limiters are named in `AppServiceProvider::registerRateLimiters()` and applied per-route via `throttle:<name>`. The password-reset email URL is overridden there to point at the SPA's `/reset-password`.
- CORS origin comes from `FRONTEND_URL`. Contact and demo-request emails go to `ADMIN_NOTIFICATION_EMAIL`.

## Frontend architecture

- Tailwind CSS v4 through `@tailwindcss/vite`, `react-router-dom` v7, plain JSX (no TypeScript).
- `App.jsx` defines four route groups, each with its own layout in `src/layouts/`: `MarketingLayout` (public pages), `AuthLayout`, `AppLayout` (`/app/*`, the logged-in passenger app), `AdminLayout` (`/admin/*`).
- **All network access goes through `src/services/`.** `api.js` is the single fetch wrapper: it adds the bearer token (kept in localStorage), unwraps `json.data`, turns errors into `Error` with `.status`/`.errors`, and on any 401 clears the token and dispatches the `lynk:auth-expired` event that `AuthContext` listens for. Add new endpoints as functions in a service file, not as inline `fetch` calls in components.
- Global state is limited to `AuthContext` and `ToastContext` (`src/context/`). `src/data/` holds static content and mock data (sectors, fallback addresses/vehicles/drivers).
- Some booking-status progression and driver messaging in the UI is simulated client-side; the API is authoritative for persisted status.
- `frontend/vercel.json` rewrites all paths to `/` for SPA routing. The root `Dockerfile` builds the PHP API only (`php artisan serve` on `$PORT`).
