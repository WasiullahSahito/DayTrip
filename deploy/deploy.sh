#!/usr/bin/env bash
# Update the Laravel API on the VPS. Run as the site's system user (not root):
#   cd /home/daytrip.ie/app && bash deploy/deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/home/daytrip.ie/app}"
PHP="${PHP:-/usr/local/lsws/lsphp83/bin/php}"
COMPOSER="${COMPOSER:-/usr/local/bin/composer}"

cd "$APP_DIR"

# Keep the site in maintenance mode only while the code and schema are changing.
"$PHP" artisan down --retry=30 || true
trap '"$PHP" artisan up' EXIT

git pull --ff-only

"$PHP" "$COMPOSER" install --no-dev --optimize-autoloader --no-interaction
"$PHP" artisan migrate --force

"$PHP" artisan optimize:clear
"$PHP" artisan optimize
"$PHP" artisan storage:link 2>/dev/null || true

# Tell the queue worker to finish its current job and exit; systemd restarts it on the new code.
"$PHP" artisan queue:restart

echo "Deployed $(git rev-parse --short HEAD)"
