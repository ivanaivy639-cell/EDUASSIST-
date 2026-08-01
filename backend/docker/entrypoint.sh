#!/bin/bash
set -e

# ── Ensure .env file exists for Laravel ───────────────────
if [ ! -f /var/www/.env ]; then
    echo "📄 Creating .env file..."
    if [ -f /var/www/.env.example ]; then
        cp /var/www/.env.example /var/www/.env
    else
        touch /var/www/.env
    fi
fi

# ── Ensure valid APP_KEY for Laravel ─────────────────────
if [ -z "$APP_KEY" ] || [[ "$APP_KEY" != base64:* ]]; then
    echo "🔑 Generating valid base64 APP_KEY for Laravel..."
    php artisan key:generate --force
    export APP_KEY=$(grep '^APP_KEY=' /var/www/.env | cut -d '=' -f2-)
fi

# ── Write Firebase credentials from env variable ────────
if [ -n "$FIREBASE_CREDENTIALS_JSON" ]; then
    mkdir -p /var/www/storage/app/firebase
    echo "$FIREBASE_CREDENTIALS_JSON" > /var/www/storage/app/firebase/service-account.json
    echo "✅ Firebase credentials written."
fi

# ── Permissions ──────────────────────────────────────────
chmod -R 777 /var/www/storage /var/www/bootstrap/cache

# ── Run migrations ───────────────────────────────────────
echo "🔄 Running migrations..."
php artisan migrate --force --no-interaction 2>&1 || true

# ── Cache config for production ──────────────────────────
php artisan config:clear 2>&1 || true
php artisan route:clear 2>&1 || true
php artisan view:clear 2>&1 || true
php artisan config:cache 2>&1 || true
php artisan route:cache 2>&1 || true
php artisan view:cache 2>&1 || true

echo "🚀 Starting Laravel server on port ${PORT:-8000}..."

# ── Start server ─────────────────────────────────────────
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
