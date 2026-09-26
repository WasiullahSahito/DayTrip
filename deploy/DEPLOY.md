# Deploying Daytrip to a Contabo VPS (Ubuntu 22.04, CyberPanel, PHP 8.3, PostgreSQL)

Layout:

| URL | What | Where on the VPS |
|---|---|---|
| `https://daytrip.ie` | React SPA (static build) | `/home/daytrip.ie/public_html` |
| `https://api.daytrip.ie` | Laravel API | code in `/home/api.daytrip.ie/app`, web root `app/public` |
| PostgreSQL | database | `127.0.0.1:5432`, not exposed |

## 1. DNS and sites (CyberPanel)

1. At your DNS provider add `A` records for `daytrip.ie`, `www` and `api` pointing to the VPS IP. Wait until they resolve.
2. CyberPanel → **Websites → Create Website**: create `daytrip.ie` and `api.daytrip.ie` (PHP 8.3, tick SSL).
3. **SSL → Issue SSL** for both (Let's Encrypt).
4. Redirect `www.daytrip.ie` → `https://daytrip.ie` (create `www` as a child domain, or use a redirect rule). The API allows exactly one origin, `https://daytrip.ie`.

## 2. Server prep (SSH as root)

```bash
# PHP 8.3 modules the app needs (Postgres driver is the important one)
apt install lsphp83-pgsql lsphp83-mbstring lsphp83-bcmath lsphp83-intl lsphp83-zip lsphp83-curl
/usr/local/lsws/lsphp83/bin/php -m | grep -E "pdo_pgsql|mbstring|bcmath"   # all three must print

# Small plans: swap so `composer install` doesn't run out of memory
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Firewall (CyberPanel → Security → Firewall): allow 22, 80, 443. Restrict 8090 (CyberPanel) and 7080 (OpenLiteSpeed admin) to your own IP. Keep 5432 closed.

## 3. Database

```bash
sudo -u postgres psql <<'SQL'
CREATE USER daytrip WITH PASSWORD 'CHOOSE-A-STRONG-PASSWORD';
CREATE DATABASE daytrip OWNER daytrip;
SQL
```

Nightly backup, copied off the server as well (Contabo's cheaper plans have no automatic backups):
`0 3 * * * pg_dump -U daytrip daytrip | gzip > /root/backups/daytrip-$(date +\%F).sql.gz`

## 4. Laravel API

Find the site user CyberPanel created: `ls -ld /home/api.daytrip.ie` (owner column). Run the rest as that user (`su - <user>` or `sudo -u <user>`).

```bash
cd /home/api.daytrip.ie
git clone <your-repo-url> app && cd app
cp deploy/.env.production.example .env && nano .env      # fill in every blank
PHP=/usr/local/lsws/lsphp83/bin/php
$PHP /usr/local/bin/composer install --no-dev --optimize-autoloader
$PHP artisan key:generate
$PHP artisan migrate --force
$PHP artisan db:seed --force          # vehicle types + drivers
$PHP artisan storage:link
$PHP artisan optimize
chmod -R ug+rw storage bootstrap/cache
```

**Web root:** CyberPanel → Websites → `api.daytrip.ie` → **vHost Conf**, change
`docRoot $VH_ROOT/public_html` to `docRoot $VH_ROOT/app/public`, save.

**Rewrite rules** (same page → **Rewrite Rules** tab, paste, save). The first rule matters: OpenLiteSpeed does not pass the `Authorization` header to PHP by default, and without it every logged-in request returns 401.

```
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [L]
```

Test: `curl https://api.daytrip.ie/api/vehicle-types` should return JSON.

## 5. Scheduler and queue worker

The app schedules `bookings:complete-due` every 5 minutes and queues its emails, so both are required.

```bash
# scheduler: crontab -e as the site user
* * * * * cd /home/api.daytrip.ie/app && /usr/local/lsws/lsphp83/bin/php artisan schedule:run >> /dev/null 2>&1

# queue worker (as root): set User/Group in the file to the site user first
cp deploy/daytrip-queue.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now daytrip-queue
systemctl status daytrip-queue
```

## 6. React frontend (build on your PC, upload the result)

```bash
cd frontend
cp .env.production.example .env.production      # fill in the Stripe key and Maps key
npm ci && npm run build
```

Upload the **contents** of `frontend/dist` (including the hidden `.htaccess`) to `/home/daytrip.ie/public_html` (CyberPanel File Manager, SFTP or `scp -r dist/. user@server:/home/daytrip.ie/public_html/`).
The `.htaccess` makes page reloads on routes like `/app/home` work. If reloading a deep link gives a 404, paste its 4 rewrite lines into the `daytrip.ie` site's **Rewrite Rules** tab instead.

## 7. Third-party settings

- **Stripe:** webhook endpoint `https://api.daytrip.ie/api/stripe/webhook`; put its signing secret in `STRIPE_WEBHOOK_SECRET`.
- **Google Maps key:** allow the `daytrip.ie` origin.
- **Mail:** use an external SMTP provider; send a test booking to check delivery.
- **Admin account:** register on the site, then
  `php artisan tinker` → `\App\Models\User::where('email','you@daytrip.ie')->first()->forceFill(['is_admin'=>true])->save();`

## 8. Releasing updates

- API: `cd /home/api.daytrip.ie/app && bash deploy/deploy.sh`
- Frontend: rebuild locally (step 6) and re-upload `dist`.

## Troubleshooting

| Symptom | Cause |
|---|---|
| 401 on every logged-in request | Authorization rewrite rule missing (step 4) |
| Browser CORS error | `FRONTEND_URL` must equal the exact origin (`https://daytrip.ie`); run `php artisan optimize` after editing `.env` |
| 500 error | `tail -n 50 storage/logs/laravel.log`; usual causes are permissions on `storage/` or a missing PHP extension |
| `could not find driver` | `lsphp83-pgsql` not installed |
| Emails never arrive | queue worker not running (`systemctl status daytrip-queue`) or SMTP settings wrong |
| Bookings never move to "completed" | scheduler cron missing |
| Deep-link reload gives 404 | SPA rewrite rules missing (step 6) |
