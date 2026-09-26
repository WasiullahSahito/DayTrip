# Daytrip

Daytrip is a taxi booking platform for passengers, business customers and administrators. A Laravel 13 JSON API and a separate React 19 single-page application provide fare quotes, bookings, account management, saved journeys, card payments (Stripe and SumUp) and fleet administration.

Live site: <https://daytrip.ie> (hosted on a Contabo VPS)

The repository holds two independent JavaScript toolchains: the Laravel root asset pipeline and the user-facing React app in `frontend/`. The React app calls the Laravel API over HTTP. In production a single domain serves both: the React build is copied into Laravel's `public/` folder and the API answers under `/api`.

> The project was previously called "Lynk". A few internal identifiers still carry that name (the `lynk:auth-expired` browser event, the `lynk-clone:token:v2` localStorage key and the `demo@lynk.ie` local seed account). They are not user-visible and can be renamed later.

## Features

- Public landing, business, company, contact, demo-request, policy and fare-estimator pages.
- Registration, login, logout, profile updates, password reset and bearer-token sessions.
- **Fare calculation on the server** from route distance, number of passengers and waiting time (see [Pricing](#pricing)).
- **Passenger seat check:** a booking for more passengers than the chosen vehicle seats is refused, and the message names the smallest vehicle that fits (for example "please select a Regular 6 Seater").
- Public vehicle-type listing and fare quotes before login.
- Cash or card bookings, scheduled trips, return journeys, flight details, notes and idempotent creation with `Idempotency-Key`.
- Booking history, active bookings, cancellation and server-authoritative booking status.
- Saved favourite addresses and reusable quick-booking templates.
- **Two card providers:** Stripe (PaymentIntents, SetupIntents, signed webhooks) and SumUp (saved cards charged from the server). Cards from both providers appear in one list with a single default.
- Contact and demo-request forms with email notification to the configured admin inbox.
- **Admin area:** dashboard statistics, booking search/filter/status changes/driver assignment, driver management, vehicle-type management and **editable fare rates**.
- Responsive React UI with Google Maps address search and geocoding (when a key is configured), browser geolocation, Stripe Elements, the SumUp Card Widget and Tailwind CSS.

Some UI behaviour is intentionally demo-oriented: the live status progression and driver messaging on the booking screen are simulated in the browser, and the trip countdown uses a simple distance/average-speed estimate. The API remains authoritative for the persisted booking and payment status.

## Site Map

The React app has four areas, each with its own layout (`frontend/src/layouts/`). All routes are defined in `frontend/src/App.jsx`.

| Area | Routes |
| --- | --- |
| **Public site** | `/` home, `/book`, `/get-demo`, `/contact`, `/company`, `/company/our-story`, `/terms`, `/privacy`, `/cookie-policy` |
| **Business pages** | `/business`, `/business/corporate`, `/business/healthcare`, `/business/hospitality`, `/public-sector`, `/business/plans`, `/business/payment-options`, `/business/qr-booker`, `/business/airport-transfers`, `/business/fare-estimator`, `/business/blog` |
| **Sign-in** | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| **Customer app** (signed in) | `/app/home` (book a ride), `/app/active/:id` (live booking), `/app/history`, `/app/favourites`, `/app/quick-bookings`, `/app/payment-methods`, `/app/profile`, `/app/reports` |
| **Admin** (admins only) | `/admin` (dashboard), `/admin/bookings`, `/admin/drivers`, `/admin/vehicle-types`, `/admin/fare-settings` |

The site is a single-page app, so every URL above returns the same HTML shell and React Router draws the page. Access to customer and admin data is enforced by the API (bearer token and, for admin, the `is_admin` flag), not by the page URL.

## Pricing

```
Fare = base fare + (price per km x km) + (charge per passenger x passengers) + (waiting charge per minute x waiting minutes)
```

| Rate | Default |
| --- | --- |
| Base fare | 7.40 EUR |
| Price per km | 2.20 EUR |
| Charge per passenger | 1.00 EUR |
| Waiting charge | 1.00 EUR per minute, for at most 60 minutes |

Example: 10 km with 3 passengers and no waiting = 7.40 + 22.00 + 3.00 = **32.40 EUR**.

- Distance is the straight-line (haversine) distance between the points, multiplied by 1.35 to allow for roads.
- The fare is always computed on the server (`VehicleType::calculateFare`). Client-supplied fares, distances and statuses are ignored. The per-vehicle rate columns are no longer used for pricing.
- Admins change the base fare, price per km, passenger charge and per-minute waiting charge at `/admin/fare-settings`. Saved values live in the `settings` table (`FareSettings` service) and override the defaults in `config/fare.php`. Changes apply to new quotes and bookings immediately; existing bookings keep the fare they were created with.
- The frontend keeps a copy of the formula (`estimateFare` in `frontend/src/data/vehicles.js`) for live previews and loads the current rates from the public `GET /api/fare-settings` endpoint. Keep both in sync if the formula changes.

## Tech Stack

### Backend

- PHP `^8.3`, Laravel `^13.17`, Laravel Sanctum for API tokens
- PostgreSQL (required for real use; tests use in-memory SQLite)
- PHPUnit, Laravel Pint, Pail, Tinker and PAO for development

### Frontend

- React `^19`, Vite `^8`, React Router DOM `^7`
- Tailwind CSS 4 with the Vite plugin, Lucide React icons, ESLint

### Integrations

- **Stripe:** Stripe PHP SDK, Stripe.js and React Stripe.js.
- **SumUp:** REST API from the backend plus SumUp's Card Widget in the browser.
- **Google Maps:** Places and Geocoding for address search.
- **SMTP mail** for booking confirmations, password resets, contact messages and demo requests.
- Database-backed queues, cache and sessions.
- Production hosting: Contabo VPS with CyberPanel/OpenLiteSpeed, a systemd queue worker and a cron-driven scheduler (see [Deployment](#deployment)).
- An optional `Dockerfile` for the API (PHP 8.3 CLI image with `pdo_pgsql`) is included.

## Architecture

1. `frontend/` is a React/Vite SPA. It handles routing, UI state, the browser copy of the Sanctum token, Google Maps, Stripe Elements and the SumUp widget. All network calls go through `src/services/`; `api.js` adds `Authorization: Bearer <token>` and sends requests to `VITE_API_URL`.
2. The repository root is a Laravel application. `routes/api.php` exposes the JSON API under `/api`. Controllers are thin: Form Requests validate input, `BookingService`, `PaymentService`, `SumUpService` and `FareSettings` hold the logic, API Resources shape output and Policies guard ownership.
3. PostgreSQL stores users, vehicle types, bookings, drivers, payments, saved addresses, quick bookings, contact messages, demo requests, processed Stripe webhook IDs and admin-editable settings.

Every API response uses `{ "success": ..., "message": "...", "data" | "errors": ... }`. `ApiExceptionRenderer` turns all exceptions under `/api` into this shape without leaking traces or SQL.

Typical booking flow:

1. The frontend gets coordinates (Google Maps or a local fallback) and calls `POST /api/fare-quote` with the passengers and waiting time.
2. A signed-in user submits `POST /api/bookings`. The backend recomputes distance and fare, checks the passenger count against the vehicle's seats and stores the booking.
3. Cash bookings are confirmed immediately. Card bookings start as `pending_payment`:
   - **Stripe:** `POST /api/payments/intents` creates a PaymentIntent from the stored fare; Stripe calls `POST /api/stripe/webhook`, whose signature is verified and event ID stored, and the booking is confirmed.
   - **SumUp:** `POST /api/payments/sumup/charge` charges the chosen saved SumUp card from the server and confirms the booking straight away (there is no SumUp webhook).
4. Confirmation emails are queued and sent by a queue worker.

## Project Structure

```text
.
|-- app/
|   |-- Console/Commands/          Scheduled booking completion command
|   |-- Http/Controllers/Api/      Public, customer and admin API controllers
|   |-- Http/Requests/             Validated request payloads
|   |-- Http/Resources/            JSON response resources
|   |-- Models/                    Eloquent models (including Setting)
|   |-- Notifications/             Booking and form-submission emails
|   |-- Policies/                  Booking, favourite and quick-booking access
|   `-- Services/                  BookingService, PaymentService, SumUpService, FareSettings
|-- config/                        App, database, mail, CORS, services and fare (config/fare.php) config
|-- database/                      Migrations and seeders
|-- deploy/                        VPS deployment guide, env template, queue service, deploy script
|-- frontend/
|   |-- src/components/            Reusable UI and booking components
|   |-- src/context/               Authentication and toast state
|   |-- src/hooks/                 e.g. useFareSettings (live fare rates)
|   |-- src/layouts/               Marketing, auth, app and admin layouts
|   |-- src/pages/                 Public, booking, account and admin pages
|   |-- src/services/              API, auth, booking, payment, maps, Stripe and SumUp clients
|   `-- package.json               Standalone React/Vite scripts
|-- routes/api.php                 JSON API routes
|-- tests/                         PHPUnit unit and feature tests
|-- Dockerfile                     Optional API image (not used on the VPS)
`-- phpunit.xml                    Test suites and test environment overrides
```

## Requirements

- PHP 8.3+ with `pdo_pgsql`, Composer.
- Node.js and npm (no exact version is pinned).
- PostgreSQL.
- SMTP credentials for email.
- Stripe credentials for Stripe card payments.
- A SumUp API key and merchant code for SumUp card payments (optional).
- A Google Maps API key with Places and Geocoding enabled (optional; without it the app uses a mock Dublin address book).

## Local Installation

```bash
composer install
copy .env.example .env        # macOS/Linux: cp .env.example .env
php artisan key:generate
```

Create a PostgreSQL database and set `DB_DATABASE`, `DB_USERNAME` and `DB_PASSWORD` in `.env` (keep `DB_CONNECTION=pgsql`; do not set `DB_URL` unless you mean to). Install both sets of JavaScript dependencies:

```bash
npm install
cd frontend
npm install
cd ..
```

Run migrations and seeders:

```bash
php artisan migrate --seed
```

The seeders create five vehicle types and five sample drivers. **Only in the `local` and `testing` environments** they also create a demo customer (`demo@lynk.ie`) and an admin (`admin@daytrip.ie`), both with the password `password123`. They are never created on a production server, so create your real admin as described under [Deployment](#deployment).

## Environment Configuration

Copy `.env.example` to `.env` and fill in the values. Never commit `.env`, and never put backend secrets in a `VITE_` variable. For production use the template in `deploy/.env.production.example`.

| Variable | Used for |
| --- | --- |
| `APP_NAME`, `APP_ENV`, `APP_KEY`, `APP_DEBUG`, `APP_URL` | Laravel identity, encryption, debugging (keep `false` in production) and base URL. |
| `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL connection. |
| `LOG_CHANNEL`, `LOG_STACK`, `LOG_LEVEL` | Logging. |
| `SESSION_DRIVER`, `QUEUE_CONNECTION`, `CACHE_STORE` | Database-backed sessions, queue and cache. |
| `MAIL_MAILER`, `MAIL_SCHEME`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | Outgoing mail. |
| `ADMIN_NOTIFICATION_EMAIL` | Inbox for contact and demo-request notifications. |
| `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET` | Stripe. The secret and webhook secret are backend-only. |
| `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE` | SumUp (backend-only). |
| `SUMUP_SETUP_AMOUNT` | EUR amount on the checkout that saves a SumUp card. `0` saves the card without charging it; use a small amount if SumUp rejects zero. |
| `FRONTEND_URL` | The site origin, used for CORS and the password-reset link in emails. Use exactly one origin. |
| `VITE_API_URL` | React API base URL (default `http://localhost:8000/api`; `https://daytrip.ie/api` in production). |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe.js publishable key (must match the mode of `STRIPE_SECRET`). |
| `VITE_GOOGLE_MAPS_API_KEY` | Browser Google Maps key. Restrict it to your site's origin(s). |

`VITE_` variables go in `frontend/.env` (development) or `frontend/.env.production` (production build) and are baked into the bundle at build time. A template is in `frontend/.env.production.example`.

## Database

Migrations create or change:

- `users` and `personal_access_tokens`: accounts and Sanctum tokens (users also hold Stripe/SumUp customer references and the default card provider).
- `vehicle_types`: passenger capacity, ETA and active state (the old rate columns remain but do not affect pricing).
- `bookings`: routes, fare, passengers, waiting minutes, status, payment method, scheduling, driver snapshots and idempotency keys.
- `drivers`, `payments` (Stripe and SumUp payments), `stripe_webhook_events`.
- `favourite_addresses`, `quick_bookings`, `contact_messages`, `demo_requests`.
- `settings`: admin-editable key/value settings (the fare rates).

PHPUnit overrides the database with SQLite `:memory:`, so tests need no PostgreSQL.

The scheduler runs `bookings:complete-due` every five minutes; it marks confirmed, non-scheduled bookings completed after their estimated duration. Run Laravel's scheduler wherever the app is deployed.

## Running Locally

Use separate terminals:

```bash
php artisan serve              # API at http://localhost:8000
cd frontend && npm run dev     # SPA at http://localhost:5173
php artisan queue:work         # queued emails
php artisan schedule:work      # scheduled booking completion
```

Set `VITE_API_URL=http://localhost:8000/api` and `FRONTEND_URL=http://localhost:5173`. Build the SPA with `cd frontend && npm run build` (output in `frontend/dist`).

## API Overview

Base path `/api`. Authentication is `Authorization: Bearer <sanctum-token>`.

### Public

| Endpoint | Purpose |
| --- | --- |
| `POST /auth/register`, `POST /auth/login` | Create an account or log in. |
| `POST /auth/forgot-password`, `POST /auth/reset-password` | Password reset. |
| `GET /vehicle-types` | Active vehicle types. |
| `GET /fare-settings` | Current fare rates (`baseFare`, `perKm`, `perPassenger`, `waitingPerMinute`, `maxWaitingMinutes`). |
| `POST /fare-quote` | Fare for a route. Body: pickup/destination coordinates; optional `passengers`, `waitingMinutes` (0-60), `vehicleTypeId`. Each vehicle in the response includes `available` and a `message` when the party is too big. |
| `POST /contact`, `POST /demo-requests` | Public forms. |
| `POST /stripe/webhook` | Stripe events (signature verified). |

### Signed-in customers

| Endpoint | Purpose |
| --- | --- |
| `POST /auth/logout`, `GET /auth/user`, `PATCH /auth/profile` | Session and profile. |
| `GET /bookings`, `GET /bookings/{id}`, `POST /bookings/{id}/cancel` | Booking history, detail and cancellation. |
| `POST /bookings` | Create a booking. Body includes pickup, destination, optional stops, `vehicleTypeId`, `passengerName`, `phone`, `paymentMethod.type` (`cash`/`card`), optional `passengers` (default 1), `waitingMinutes`, schedule, notes and return journey. Returns 422 on `passengers` if the vehicle is too small. Fare and status are server-controlled. |
| `GET/POST/DELETE /favourites`, `GET/POST/DELETE /quick-bookings` | Saved addresses and journey templates. |
| `POST /payments/intents` | Stripe PaymentIntent for a payable card booking. |
| `POST /payments/sumup/charge` | Pay a booking with a saved SumUp card. Body: `bookingId`, `cardId` (`sumup:<token>`). |
| `GET /payment-methods` | Saved cards from both providers (`provider`: `stripe` or `sumup`). |
| `POST /payment-methods/setup-intent`, `POST /payment-methods` | Save a Stripe card. |
| `POST /payment-methods/sumup/checkout`, `POST /payment-methods/sumup/confirm` | Start and confirm saving a SumUp card (the card form is SumUp's own widget). |
| `DELETE /payment-methods/{id}`, `POST /payment-methods/{id}/default` | Remove a card or make it the default. |

### Admin (`is_admin` required)

| Endpoint | Purpose |
| --- | --- |
| `GET /admin/stats` | Dashboard statistics. |
| `GET/POST/PATCH/DELETE /admin/drivers` | Driver management. |
| `GET/POST/PATCH /admin/vehicle-types` | Vehicle-type management. |
| `GET /admin/bookings`, `PATCH /admin/bookings/{id}/status`, `POST /admin/bookings/{id}/assign-driver` | Booking management. |
| `GET/PATCH /admin/fare-settings` | Read and change the fare rates. |

All routes are rate limited, with stricter named limits for login, registration, password reset, booking creation, payment intents and contact forms.

## Authentication and Security

- Sanctum bearer tokens are created at registration and login. The SPA keeps the token in `localStorage` and clears it on any `401`.
- Admin access is the database `users.is_admin` flag plus the `admin` middleware. It cannot be set through registration or the profile endpoint.
- Policies scope bookings, favourites and quick bookings to their owner.
- Fare, distance, duration, status, references and payment amounts are never accepted from the client.
- Card numbers, expiry dates and CVCs are typed into Stripe's or SumUp's own hosted forms and never reach this API. SumUp saved-card ownership is checked before any charge or removal, and SumUp setup results are re-verified with SumUp rather than trusted from the browser.
- The Stripe webhook requires a valid signature; processed event IDs prevent duplicate handling.
- CORS allows only `FRONTEND_URL`.

## Testing

```bash
composer run test          # backend
cd frontend && npm run lint
```

The PHPUnit suite covers authentication, bookings (fare formula, seat check, ownership, idempotency), Stripe and SumUp payments (SumUp is tested with faked HTTP calls, never the real service), admin access, fare settings, driver and vehicle management, favourites, quick bookings and the scheduled completion command.

## Deployment

Daytrip runs in production on a **Contabo VPS** (Ubuntu 22.04) managed with CyberPanel (OpenLiteSpeed), using PHP 8.3 (LSPHP) and a local PostgreSQL that is not exposed to the internet. One domain serves everything:

| URL | Serves |
| --- | --- |
| `https://daytrip.ie/...` | The React build (static files in Laravel's `public/`) |
| `https://daytrip.ie/api/...` | The Laravel API |

The complete step-by-step guide is in **[`deploy/DEPLOY.md`](deploy/DEPLOY.md)**. In short:

1. Point the domain's `A` records at the VPS IP, create the site and SSL certificate in CyberPanel, install the PHP Postgres driver (`lsphp83-pgsql`) and create the database and user.
2. Clone the repository to `/home/<domain>/app`, copy `deploy/.env.production.example` to `.env`, fill it in, then run `composer install --no-dev --optimize-autoloader`, `php artisan key:generate`, `php artisan migrate --force`, `php artisan db:seed --force`, `php artisan storage:link` and `php artisan optimize`.
3. Point the site's web root (`docRoot`) at `app/public` and put the rewrite rules from the guide in `app/public/.htaccess`. They send `/api/...` to Laravel and every other page to the React app, and they pass the `Authorization` header through (without that line every logged-in request fails with `401`).
4. Register a cron entry for `php artisan schedule:run` (every minute) and run the queue worker as a service (`deploy/daytrip-queue.service`).
5. Build the frontend on your own machine (`cd frontend && npm ci && npm run build`, with `frontend/.env.production` filled in) and upload the contents of `frontend/dist` into `app/public`.
6. Create the admin account by registering on the site and running, in `tinker`, `\App\Models\User::where('email', '...')->first()->forceFill(['is_admin' => true])->save();`.
7. Point Stripe's webhook at `https://daytrip.ie/api/stripe/webhook`.

To update later: run `deploy/deploy.sh` for the API (pull, install, migrate, cache, restart the queue) and rebuild and re-upload the frontend when it changes. Run `artisan` commands as the site's user, not as root, so that log and cache files stay writable by the web server.

### Email in production

Booking confirmations and other emails are queued, so the queue worker must be running. Whichever SMTP server you use, sending domain authentication matters: Gmail rejects mail that has neither valid SPF nor DKIM. If mail is sent from the VPS's own mail server, add these DNS records for your domain: an SPF `TXT` record, the DKIM `TXT` record for the selector the mail server signs with, and a DMARC `TXT` record. Also set a reverse-DNS (PTR) name for the server's IP. Alternatively use an external SMTP service and set the `MAIL_*` variables accordingly.

### Notes

- After changing `.env` on the server run `php artisan optimize` and restart the queue worker, because Laravel caches configuration and the worker reads it only at start.
- Keep `APP_DEBUG=false`, use live Stripe keys (`sk_live_...`/`pk_live_...`) for real payments, and keep the Postgres port closed to the internet. In the CyberPanel firewall allow only ports 22, 80 and 443, and restrict 8090 and 7080 to your own IP.
- Contabo blocks outbound port 25, so use an external SMTP provider (submission port 587) for the `MAIL_*` variables.
- Back up the database nightly with `pg_dump` and copy the dump off the server.
- The `Dockerfile` is not used by the Contabo deployment; it exists for container-based hosts, where the React app is built and served separately.

## Known Limitations

- The booking screen's live tracking and driver messaging are simulated in the browser, not connected to real drivers or GPS.
- The trip-time estimate assumes an average of 28 km/h for every trip, which is too slow for long inter-city journeys. The fare uses distance, not this estimate.
- SumUp: saved cards do not show an expiry date (SumUp does not return one), charges are confirmed synchronously with no webhook, and a card needing extra bank verification is not handled.
- SumUp's API is not reachable from some regions (SumUp blocks them at its firewall), so test SumUp from a supported region or from the server.

## Contributing

1. Create a focused branch from the default branch.
2. Install dependencies and configure a local `.env` without committing secrets.
3. Make a focused change with tests where behaviour changes.
4. Run `composer run test`, `cd frontend && npm run lint` and the relevant builds.
5. Open a pull request describing the change, the validation performed, any migrations and any environment-variable changes.

## License

No standalone `LICENSE` file is present. `composer.json` declares the package metadata as MIT, but the repository does not include the license text; confirm the intended license before publishing.
