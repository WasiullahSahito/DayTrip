# Deploying Daytrip to a Contabo VPS (Ubuntu 22.04, CyberPanel, PHP 8.3, PostgreSQL)

One domain, `daytrip.ie`, serves everything:

| URL | What |
|---|---|
| `https://daytrip.ie/…` | React SPA (static files copied into Laravel's `public/`) |
| `https://daytrip.ie/api/…` | Laravel API |
| PostgreSQL | `127.0.0.1:5432` on the same VPS, not exposed |

Laravel lives in `/home/daytrip.ie/app`; the site's web root is `/home/daytrip.ie/app/public`.

## 1. DNS and site (CyberPanel)

1. `A` records for `daytrip.ie` and `www` pointing to the VPS IP.
2. CyberPanel → Websites → Create Website: `daytrip.ie`, PHP 8.3.
3. SSL → Issue SSL for `daytrip.ie`.

## 2. Server prep (SSH as root)

```bash
apt update
apt install -y lsphp83-pgsql lsphp83-mbstring lsphp83-bcmath lsphp83-intl lsphp83-zip lsphp83-curl git
/usr/local/lsws/lsphp83/bin/php -m | grep -E "pdo_pgsql|mbstring|bcmath"   # all three must print
```

Small plans: add swap so `composer install` doesn't run out of memory:
```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Firewall (CyberPanel → Security → Firewall): allow 22, 80, 443. Restrict 8090 and 7080 to your own IP. Keep 5432 closed.

## 3. Database

```bash
sudo -u postgres psql -c "CREATE USER daytrip WITH PASSWORD 'CHOOSE-A-STRONG-PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE daytrip OWNER daytrip;"
```
Nightly backup (also copy it off the server):
`0 3 * * * pg_dump -U daytrip daytrip | gzip > /root/backups/daytrip-$(date +\%F).sql.gz`

## 4. Laravel

Find the site user: `ls -ld /home/daytrip.ie` (owner column) = `SITEUSER`.

```bash
cd /home/daytrip.ie
git clone <your-repo-url> app && cd app
cp deploy/.env.production.example .env && nano .env      # fill in every blank
export COMPOSER_ALLOW_SUPERUSER=1
PHP=/usr/local/lsws/lsphp83/bin/php
$PHP /usr/local/bin/composer install --no-dev --optimize-autoloader
$PHP artisan key:generate
$PHP artisan migrate --force
$PHP artisan db:seed --force          # vehicle types + drivers
$PHP artisan storage:link
$PHP artisan optimize
chown -R SITEUSER:SITEUSER /home/daytrip.ie/app
chmod -R ug+rw storage bootstrap/cache
```

CyberPanel → Websites → `daytrip.ie` → Manage → **vHost Conf**: change
`docRoot $VH_ROOT/public_html` to `docRoot $VH_ROOT/app/public`, save.

Then replace Laravel's `.htaccess` with these rules (OpenLiteSpeed reads it from the web root; the CyberPanel "Rewrite Rules" tab only edits `public_html/.htaccess`, which is no longer the web root, so do not use it). The `Authorization` line matters: without it every logged-in request returns 401.

```bash
cat > /home/daytrip.ie/app/public/.htaccess <<'EOF'
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteRule ^api(/.*)?$ index.php [L]
RewriteRule ^$ /index.html [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
EOF
chown SITEUSER:SITEUSER /home/daytrip.ie/app/public/.htaccess
/usr/local/lsws/bin/lswsctrl restart
```

Test: `https://daytrip.ie/api/vehicle-types` returns JSON.

## 5. Scheduler and queue worker

The app schedules `bookings:complete-due` every 5 minutes and queues its emails, so both are required.

```bash
(crontab -u SITEUSER -l 2>/dev/null; echo '* * * * * cd /home/daytrip.ie/app && /usr/local/lsws/lsphp83/bin/php artisan schedule:run >> /dev/null 2>&1') | crontab -u SITEUSER -

cp /home/daytrip.ie/app/deploy/daytrip-queue.service /etc/systemd/system/
sed -i 's/CHANGE_ME/SITEUSER/g' /etc/systemd/system/daytrip-queue.service
systemctl daemon-reload && systemctl enable --now daytrip-queue
systemctl status daytrip-queue
```

## 6. React frontend (build on your PC)

```powershell
cd frontend
copy .env.production.example .env.production      # fill in the Stripe key and Maps key
npm ci
npm run build
```

Upload the **contents** of `frontend/dist` into `/home/daytrip.ie/app/public` (next to Laravel's `index.php`; do not delete Laravel's files there). Easiest: zip the contents of `dist`, upload the zip with CyberPanel File Manager, then Extract.

Test: `https://daytrip.ie` loads; open `/login` and reload, it must still load.

## 7. Third-party settings

- **Stripe:** webhook endpoint `https://daytrip.ie/api/stripe/webhook`; its signing secret goes in `STRIPE_WEBHOOK_SECRET`; then `php artisan optimize`.
- **Google Maps key:** allow the `daytrip.ie` origin.
- **Mail:** external SMTP provider (Contabo blocks port 25); send a test booking.
- **Admin account:** register on the site, then
  `php artisan tinker --execute="\App\Models\User::where('email','you@daytrip.ie')->first()->forceFill(['is_admin'=>true])->save();"`

## 8. Releasing updates

- API: `sudo -u SITEUSER bash /home/daytrip.ie/app/deploy/deploy.sh`
- Frontend: rebuild locally (step 6) and re-upload the contents of `dist`.

## Troubleshooting

| Symptom | Cause |
|---|---|
| 401 on every logged-in request | Authorization rewrite line missing (step 4) |
| `/api/...` shows the React page or 404 | rewrite rules not saved, or `docRoot` not `app/public` |
| Reloading `/login` gives 404 | last rewrite rule missing (step 4) |
| 500 error | `tail -n 50 storage/logs/laravel.log`; usual causes are permissions on `storage/` or a missing PHP extension |
| `could not find driver` | `lsphp83-pgsql` not installed |
| Emails never arrive | queue worker not running (`systemctl status daytrip-queue`) or SMTP settings wrong |
| Bookings never move to "completed" | scheduler cron missing |
