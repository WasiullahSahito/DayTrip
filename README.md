# Lynk

Lynk is a taxi booking platform prototype for passengers, business customers, dispatchers, and administrators. It combines a Laravel API with a separate React single-page application for route quoting, booking, account management, saved journeys, Stripe payments, and fleet administration.

The repository contains two independent frontend toolchains: the Laravel root asset pipeline and the user-facing React app in `frontend/`. The React app calls the Laravel API over HTTP; it is not served by Laravel's default web route.

## Features

- Public landing, business, company, contact, demo-request, policy, and fare-estimator pages.
- User registration, login, logout, profile updates, password reset, and bearer-token session persistence.
- Server-side route distance, duration, and fare calculation from pickup, stops, destination, and vehicle rates.
- Public vehicle-type listing and fare quotes before authentication.
- Authenticated cash or card bookings, scheduled trips, return journeys, flight details, notes, and idempotent creation with `Idempotency-Key`.
- Booking history, active bookings, cancellation, and server-authoritative booking status.
- Saved favourite addresses and reusable quick-booking templates.
- Stripe PaymentIntents, SetupIntents, saved card management, default payment methods, and signed webhook processing.
- Customer and demo-request forms with optional email notification to the configured admin inbox.
- Admin dashboard statistics, driver management, vehicle-type management, booking search/filtering, status changes, and driver assignment.
- Responsive React UI with Google Maps address search/geocoding when configured, browser geolocation, Stripe Elements, and Tailwind CSS.

Some UI behavior is intentionally demo-oriented: frontend live-status progression and driver messaging are simulated locally, while the API remains authoritative for persisted booking/payment status.

## Tech Stack

### Backend

- PHP `^8.3`
- Laravel `^13.17`
- Laravel Sanctum `^4.0` for API tokens
- Laravel Eloquent and migrations
- PostgreSQL for the configured application database
- PHPUnit `^12.5.12` and Laravel testing utilities
- Laravel Pail, Pint, Tinker, and PAO as development dependencies

### Frontend

- React `^19.2.8`
- Vite `^8.2.2` in `frontend/`
- React Router DOM `^7.18.2`
- Tailwind CSS with the Vite plugin
- Lucide React icons
- ESLint `^10.9.0`

### Integrations and infrastructure

- Stripe PHP SDK `^21.3`, Stripe.js, and React Stripe.js for payments.
- Google Maps JavaScript API Places and Geocoding libraries for address lookup and map features.
- SMTP mail for booking confirmations, password-reset mail, contact messages, and demo requests.
- Database-backed queues, cache, and sessions in the example application configuration.
- No Docker, CI workflow, hosting manifest, or deployment provider configuration is present in this repository.

## Architecture

The application is split into two independently runnable applications:

1. `frontend/` is a React/Vite SPA. It handles page routing, UI state, browser storage of the Sanctum token, Google Maps interactions, and Stripe client-side Elements. Its API client sends JSON requests to `VITE_API_URL` and adds `Authorization: Bearer <token>` when a token exists.
2. The repository root is a Laravel 13 application. `routes/api.php` exposes the JSON API under `/api`; controllers validate input through Form Requests, services calculate fares and coordinate payment/booking workflows, and API Resources shape responses.
3. PostgreSQL stores users, vehicle types, bookings, drivers, payments, saved addresses, quick bookings, contact messages, demo requests, and processed Stripe webhook IDs. Foreign keys and Eloquent relationships connect the records.

Typical booking flow:

1. The frontend obtains coordinates through Google Maps or its local fallback and requests `/api/fare-quote`.
2. An authenticated user submits `/api/bookings`. The backend recalculates distance, duration, and fare from coordinates and the selected vehicle type; client-supplied fare, distance, duration, and status are not accepted.
3. Cash bookings are confirmed immediately. Card bookings begin as `pending_payment`; `/api/payments/intents` creates a Stripe PaymentIntent from the stored server-side fare.
4. Stripe calls `/api/stripe/webhook`. The signature is verified, event IDs are recorded idempotently, and payment/booking state is updated.

The Laravel web route currently returns the default `welcome` view. Deploy the React SPA separately, or add an explicit integration if Laravel should serve its built files.

## Project Structure

```text
.
|-- app/
|   |-- Console/Commands/          Scheduled booking completion command
|   |-- Http/Controllers/Api/      Public, customer, and admin API controllers
|   |-- Http/Requests/             Validated request payloads
|   |-- Http/Resources/            JSON response resources
|   |-- Models/                    Eloquent models and relationships
|   |-- Notifications/             Booking and form-submission notifications
|   |-- Policies/                  Booking, favourite, and quick-booking access
|   `-- Services/                  Booking and Stripe payment workflows
|-- bootstrap/                     Laravel application and middleware setup
|-- config/                        Application, database, mail, CORS, and services config
|-- database/
|   |-- migrations/                PostgreSQL schema migrations
|   `-- seeders/                   Vehicle, driver, and demo-user seed data
|-- frontend/
|   |-- src/components/            Reusable React UI and booking components
|   |-- src/context/               Authentication and toast state
|   |-- src/layouts/               Marketing, auth, app, and admin layouts
|   |-- src/pages/                 Public, booking, account, and admin pages
|   |-- src/services/              API, auth, booking, maps, and Stripe clients
|   `-- package.json               Standalone React/Vite scripts and dependencies
|-- resources/                     Laravel Blade/CSS/JS assets
|-- routes/api.php                 JSON API route definitions
|-- routes/web.php                 Root web route
|-- tests/                         PHPUnit unit and feature tests
|-- composer.json                  PHP dependencies and Laravel scripts
|-- package.json                   Root Laravel Vite asset scripts
`-- phpunit.xml                    Test suites and test environment overrides
```

## Requirements

- PHP 8.3 or newer, matching `composer.json`.
- Composer.
- Node.js and npm compatible with the declared Vite 8 toolchains. An exact Node version is not pinned in the repository.
- A compatible PostgreSQL installation for the configured application database. The `.env.example` explicitly marks PostgreSQL as mandatory for normal application use.
- PHP PostgreSQL PDO support (`pdo_pgsql`).
- SMTP credentials for email features.
- Stripe account credentials for card payments.
- A Google Maps API key with the required Places and Geocoding APIs enabled for live address search.

## Installation

From the repository root:

```bash
composer install
copy .env.example .env
php artisan key:generate
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

Create a PostgreSQL database, then set `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in `.env`. Keep `DB_CONNECTION=pgsql` unless you are intentionally changing the application configuration.

Install both JavaScript dependency sets:

```bash
npm install
cd frontend
npm install
cd ..
```

Run migrations and the included seeders:

```bash
php artisan migrate --seed
```

The seeders create five vehicle types, five drivers, a demo customer (`demo@lynk.ie`), and an admin user (`admin@lynk.ie`). The seeded demo passwords are `password123`; change or remove these accounts outside local development.

No `storage:link` command is required by the current source. No user-upload storage flow is implemented.

## Environment Configuration

Copy `.env.example` to `.env` and replace blank values with local or deployment values. Never commit `.env` or expose backend secrets to the Vite build.

| Variable | Used for |
| --- | --- |
| `APP_NAME`, `APP_ENV`, `APP_KEY`, `APP_DEBUG`, `APP_URL` | Laravel identity, encryption, debugging, and base URL. |
| `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL connection. |
| `BCRYPT_ROUNDS` | Password hashing cost. |
| `LOG_CHANNEL`, `LOG_STACK`, `LOG_LEVEL` | Laravel logging. |
| `SESSION_DRIVER`, `SESSION_LIFETIME`, `SESSION_ENCRYPT`, `SESSION_DOMAIN` | Laravel session configuration. |
| `QUEUE_CONNECTION` | Queue backend; the example uses the database queue. |
| `CACHE_STORE` | Cache backend; the example uses the database cache. |
| `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | SMTP and outgoing mail settings. |
| `ADMIN_NOTIFICATION_EMAIL` | Inbox for contact and demo-request notifications. |
| `STRIPE_KEY` | Stripe publishable/backend service configuration value. |
| `STRIPE_SECRET` | Backend-only Stripe API secret. Never expose it to Vite. |
| `STRIPE_WEBHOOK_SECRET` | Backend-only secret used to verify `Stripe-Signature`. |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated for multiple origins. |
| `VITE_API_URL` | React API base URL; defaults to `http://localhost:8000/api`. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe.js publishable key for the React app. |
| `VITE_GOOGLE_MAPS_API_KEY` | Browser-visible Google Maps key for Places and Geocoding. Restrict it to the SPA origins. |

The frontend variables belong in `frontend/.env` or another environment file loaded by the frontend Vite process. Only variables prefixed with `VITE_` are bundled into client code.

## Database Setup

The normal application database is PostgreSQL. Migrations create or modify:

- `users` and `personal_access_tokens` for accounts and Sanctum tokens.
- `vehicle_types` for passenger capacity, fare rates, ETA, and active state.
- `bookings` for routes, fare snapshots, status, payment method, scheduling, driver snapshots, and idempotency keys.
- `drivers` for the admin-managed driver pool and booking assignment link.
- `payments` for Stripe PaymentIntent metadata and status.
- `stripe_webhook_events` for idempotent webhook processing.
- `favourite_addresses` and `quick_bookings` for user-owned reusable journey data.
- `contact_messages` and `demo_requests` for public form submissions.

Run `php artisan migrate --seed` for a fresh local database. PHPUnit overrides the database to SQLite `:memory:` and uses the test environment values from `phpunit.xml`; it does not require a PostgreSQL test database.

The scheduler registers `bookings:complete-due` every five minutes. It marks confirmed, non-scheduled bookings completed after their estimated duration, so a deployed environment must run Laravel's scheduler for that behavior.

## Running the Application

Use separate terminals for the API, the React SPA, and background processing:

```bash
# Terminal 1: Laravel API at http://localhost:8000
php artisan serve

# Terminal 2: React SPA, normally at the Vite default http://localhost:5173
cd frontend
npm run dev

# Terminal 3: process database-backed queued notifications
php artisan queue:work

# Terminal 4: run the scheduled booking completion command
php artisan schedule:work
```

The exact Vite port is not hard-coded in `frontend/vite.config.js`; Vite uses its default unless overridden with `--port`. Set `VITE_API_URL=http://localhost:8000/api` and `FRONTEND_URL=http://localhost:5173` for this local arrangement.

For production frontend assets:

```bash
cd frontend
npm run build
npm run preview
```

The root asset pipeline is separate:

```bash
npm run build
```

## API Documentation

The API base path is `/api`. Successful responses use `{ "success": true, "message": "...", "data": ... }`; validation and application failures use a corresponding error envelope. Authentication uses `Authorization: Bearer <sanctum-token>`.

### Public endpoints

| Method and endpoint | Body/query | Response and behavior |
| --- | --- | --- |
| `POST /auth/register` | `firstName`, `lastName`, `email`, `password`, `password_confirmation`, `phone`, `accountType` (`personal`, `business`, or `business-plus`), and `businessName` when required | `201`; user resource and token. |
| `POST /auth/login` | `email`, `password` | `200`; user resource and token. Wrong credentials return a generic validation error. |
| `POST /auth/forgot-password` | `email` | `200`; generic message whether or not the account exists. |
| `POST /auth/reset-password` | `token`, `email`, `password`, `password_confirmation` | `200`; resets the password and revokes existing tokens. |
| `GET /vehicle-types` | None | Active vehicle types with public display fields. |
| `POST /fare-quote` | `pickup.lat`, `pickup.lng`, `destination.lat`, `destination.lng`; optional `vehicleTypeId` | `200`; fare, EUR currency, distance, and duration keyed by vehicle type. Calculated server-side. |
| `POST /contact` | `name`, `email`, `topic`, `message` | `201`; stores the message and optionally notifies `ADMIN_NOTIFICATION_EMAIL`. |
| `POST /demo-requests` | `companyName`, `name`, `email`, `phone`, `businessType`, optional `users`, `message` | `201`; stores the request and optionally notifies the admin inbox. |
| `POST /stripe/webhook` | Raw Stripe event body plus `Stripe-Signature` header | `200` for a verified event; `400` for invalid payload/signature. No bearer token; signature verification is required. |

### Authenticated customer endpoints

All rows in this section require Sanctum bearer authentication.

| Method and endpoint | Body/query | Response and behavior |
| --- | --- | --- |
| `POST /auth/logout` | None | `200`; deletes the current access token. |
| `GET /auth/user` | None | `200`; current user resource. |
| `PATCH /auth/profile` | Optional `firstName`, `lastName`, `phone` | `200`; updated user resource. Email, account type, and business name are not accepted. |
| `GET /bookings` | Optional `status=active\|history`, `per_page` up to 50 | `200`; user-scoped paginated booking data and pagination metadata. |
| `POST /bookings` | Pickup/destination points (`label`, optional `secondary`, `lat`, `lng`), optional up to three `stops`, `vehicleTypeId`, `passengerName`, `phone`, `paymentMethod.type` (`cash` or `card`), and optional schedule, notes, flight, confirmation email, and return-journey fields | `201`; booking resource. Send `Idempotency-Key` to make retries return the original booking. Fare and status are server-controlled. |
| `GET /bookings/{booking}` | None | `200`; booking resource if owned by the caller. |
| `POST /bookings/{booking}/cancel` | None | `200`; cancelled booking if the caller owns it and its status is cancellable. |
| `GET /favourites` | None | `200`; current user's favourite addresses. |
| `POST /favourites` | `nickname`, `label`, optional `secondary`, `lat`, `lng` | `201`; created favourite address. |
| `DELETE /favourites/{favourite}` | None | `200`; remaining user favourites if owned by the caller. |
| `GET /quick-bookings` | None | `200`; current user's saved journey templates. |
| `POST /quick-bookings` | `label`, `vehicleTypeId`, pickup point, destination point | `201`; saved template collection. |
| `DELETE /quick-bookings/{quickBooking}` | None | `200`; remaining templates if owned by the caller. |
| `POST /payments/intents` | `bookingId` | `200`; Stripe `clientSecret` and payment resource for an owned, payable card booking. Amount is read from the stored booking fare. |
| `GET /payment-methods` | None | `200`; user's Stripe card metadata only (brand, last four, expiry, default flag). |
| `POST /payment-methods/setup-intent` | None | `200`; Stripe SetupIntent client secret. |
| `POST /payment-methods` | `paymentMethodId` | `201`; attaches a Stripe PaymentMethod to the caller's Stripe customer and returns card metadata. |
| `DELETE /payment-methods/{paymentMethod}` | None | `200`; detaches the caller's Stripe PaymentMethod and returns remaining cards. |
| `POST /payment-methods/{paymentMethod}/default` | None | `200`; sets the caller's default Stripe PaymentMethod. |

### Admin endpoints

All rows in this section require Sanctum authentication and `is_admin=true`.

| Method and endpoint | Body/query | Response and behavior |
| --- | --- | --- |
| `GET /admin/stats` | None | `200`; dashboard statistics. |
| `GET /admin/drivers` | None | `200`; driver collection. |
| `POST /admin/drivers` | `name`, `reg`, `car`, `color`; optional `phone`, `rating`, `is_active` | `201`; created driver. |
| `PATCH /admin/drivers/{driver}` | Any subset of driver fields | `200`; updated driver. |
| `DELETE /admin/drivers/{driver}` | None | `200`; deletes the driver. Existing booking snapshots remain available and the FK is nullable on delete. |
| `GET /admin/vehicle-types` | None | `200`; all vehicle types including inactive types and rate fields. |
| `POST /admin/vehicle-types` | `key`, `name`, `passengers`, `base_fare`, `per_km`, `per_min`, `min_fare`; optional `icon`, `caption`, `eta_mins`, `is_active` | `201`; created vehicle type. |
| `PATCH /admin/vehicle-types/{vehicleType}` | Any subset of vehicle-type fields | `200`; updated vehicle type. |
| `GET /admin/bookings` | Optional `status`, `search`, `per_page` up to 50 | `200`; paginated bookings across users. |
| `PATCH /admin/bookings/{booking}/status` | `status` from the implemented booking status list | `200`; updated admin booking resource. |
| `POST /admin/bookings/{booking}/assign-driver` | `driverId` | `200`; booking with the assigned driver snapshot. |

All routes are additionally subject to the API throttle middleware and several named throttles for authentication, contact, booking creation, payment intents, and Stripe webhooks.

## Authentication & Authorization

- Laravel Sanctum issues personal access tokens created by registration and login. The SPA stores the token in browser `localStorage` under `lynk-clone:token` and sends it as a bearer token.
- Logout deletes the current token. Password reset deletes all of the user's existing tokens after a successful reset.
- Registration accepts an account plan (`personal`, `business`, or `business-plus`), not a self-assigned security role. Admin access is controlled by the database `users.is_admin` boolean and the `admin` middleware.
- Booking, favourite, and quick-booking policies scope records to their owning user. Admin routes use `auth:sanctum` followed by the admin middleware.
- Form Requests validate and whitelist input. Fare, route distance, duration, booking status, references, and payment amounts are server-authoritative.
- Passwords use Laravel's `hashed` cast. Login and password-reset flows deliberately avoid account enumeration in their responses.
- Stripe card details are collected by Stripe Elements. The API receives Stripe PaymentMethod IDs rather than raw card numbers, expiry, or CVC.
- The Stripe webhook is unauthenticated by design but requires a valid signature verified with `STRIPE_WEBHOOK_SECRET`; processed event IDs prevent duplicate processing.
- CORS allows only the configured `FRONTEND_URL` origin(s), and API endpoints use rate limiting.

## Testing

Automated PHPUnit tests are present under `tests/Feature` and `tests/Unit`, including authentication, booking ownership and idempotency, payments, favourites, quick bookings, admin access, driver and vehicle management, smoke coverage, and scheduled booking completion.

Run the full suite from the repository root:

```bash
composer run test
```

Equivalent direct command:

```bash
php artisan config:clear
php artisan test
```

The frontend also provides an ESLint check:

```bash
cd frontend
npm run lint
```

No coverage percentage is specified or claimed by the repository.

## Deployment

No deployment configuration is committed. The following is guidance based on the current architecture, not a preconfigured deployment recipe.

Deploy the Laravel API to a PHP 8.3+ host with Composer, PostgreSQL, a web server capable of routing requests to `public/index.php`, and long-running workers for database-backed queues. Configure production environment values, run `composer install --no-dev --optimize-autoloader`, run `php artisan migrate --force`, and build/cache configuration as appropriate for the host. Run `php artisan queue:work` and a scheduler process that invokes `php artisan schedule:run` every minute, or an equivalent scheduler service.

Build the React application separately with `cd frontend && npm install && npm run build`, then serve `frontend/dist` from a static host or web server configured for SPA history fallback. Set `VITE_API_URL` to the deployed API `/api` base URL, `VITE_STRIPE_PUBLISHABLE_KEY` to the Stripe publishable key, and `VITE_GOOGLE_MAPS_API_KEY` to a restricted browser key before building. Set the API's `FRONTEND_URL` to the deployed SPA origin and configure Stripe's webhook endpoint as `<API_URL>/api/stripe/webhook`.

Do not place `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, database passwords, SMTP passwords, or other backend secrets in frontend environment files.

## Screenshots / Demo

No screenshots or live demo URL are included in the repository.

## Contributing

1. Create a focused branch from the current default branch.
2. Install dependencies and configure a local `.env` without committing secrets.
3. Make a focused change with tests where behavior changes.
4. Run `composer run test`, `cd frontend && npm run lint`, and the relevant build commands.
5. Open a pull request describing the change, validation performed, database migrations, and any environment-variable changes.

## License

No standalone `LICENSE` file is present. `composer.json` declares the package metadata as MIT, but the repository does not include the corresponding license text; confirm the intended project license before publishing.
