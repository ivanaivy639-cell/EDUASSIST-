#!/bin/bash
set -e

# ── Write Firebase credentials from env variable ────────
if [ -n "$FIREBASE_CREDENTIALS_JSON" ]; then
    mkdir -p /var/www/storage/app/firebase
    echo "$FIREBASE_CREDENTIALS_JSON" > /var/www/storage/app/firebase/service-account.json
    echo "✅ Firebase credentials written."
fi

# ── Run migrations ───────────────────────────────────────
echo "🔄 Running migrations..."
php artisan migrate --force --no-interaction 2>&1 || true

# ── Cache config for production ──────────────────────────
php artisan config:cache 2>&1 || true
php artisan route:cache 2>&1 || true
php artisan view:cache 2>&1 || true

echo "🚀 Starting Laravel server on port ${PORT:-8000}..."

# ── Start server ─────────────────────────────────────────
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
