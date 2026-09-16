# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is a freshly scaffolded project, not yet customized. The backend is an unmodified Laravel 13 skeleton (default `welcome` route, default `User` model/migration, no app-specific controllers, models, or routes). `frontend/` is a separate, unmodified `create-vite` React 19 scaffold. Treat both as starting points — there is no existing domain code (e.g. bookings, drivers, trips) to discover yet.

## Two independent frontends — don't conflate them

This repo has **two unrelated JS toolchains**, each with its own `package.json`, `vite.config.js`, and `node_modules`:

1. **Root** (`/`) — Laravel's own asset pipeline via `laravel-vite-plugin`. Entry points are `resources/js/app.js` and `resources/css/app.css`, built into Blade views (`resources/views/welcome.blade.php`). Run with `npm run dev` / `npm run build` from the repo root.
2. **`frontend/`** — a standalone React + Vite SPA (its own `index.html`, `src/App.jsx`). It is **not** connected to the Laravel app in any way (no API calls, no shared build, no laravel-vite-plugin). Run with `npm run dev` / `npm run build` from inside `frontend/`.

When adding frontend work, first clarify (or infer from the task) which of these two the work belongs to — a Blade-served page vs. the standalone SPA — since they don't share dependencies or build output.

## Commands

### Backend (PHP/Laravel, run from repo root)

- Install deps: `composer install`
- Run full dev stack (server + queue listener + Pail log tailing + Vite, concurrently): `composer run dev`
- Run tests: `composer run test` (clears config cache, then runs `php artisan test`)
- Run a single test: `php artisan test --filter=test_name_or_class`
- Format code (Pint, Laravel's PHP-CS-Fixer wrapper): `vendor/bin/pint`
- Tinker REPL: `php artisan tinker`

Tests use PHPUnit (`phpunit.xml`) with an in-memory SQLite DB, array cache/session, sync queue, and null mail driver — no external services needed. Test suites live in `tests/Unit` and `tests/Feature`.

### Root frontend assets (Laravel's Vite pipeline)

- Dev server: `npm run dev`
- Production build: `npm run build`

### Standalone SPA (`frontend/`)

- Install deps: `cd frontend && npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Architecture notes

- PHP namespace root `App\` maps to `app/`; `Database\Factories\` and `Database\Seeders\` map to `database/factories/` and `database/seeders/` (see `composer.json` autoload).
- DB is SQLite (`database/database.sqlite`) for local dev; tests override to `:memory:` sqlite regardless of `.env`.
- `laravel/pao` is installed as a dev dependency (visible in `composer.json`/`vendor/laravel/pao`) — check its docs before assuming Boost-specific tooling is present; Laravel Boost itself is **not** installed in this repo despite `AGENTS.md` referencing its bootstrap install steps.
