FROM php:8.3-cli

# ── System dependencies ─────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl zip unzip libpq-dev libzip-dev libpng-dev libjpeg-dev \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install pdo_pgsql pgsql zip bcmath gd \
    && rm -rf /var/lib/apt/lists/*

# ── Composer ─────────────────────────────────────────────
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# ── Dependencies first (Docker layer cache) ──────────────
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# ── Copy app ─────────────────────────────────────────────
COPY . .

# ── Post-install ─────────────────────────────────────────
RUN composer dump-autoload --optimize \
    && php artisan config:clear \
    && php artisan route:clear \
    && php artisan view:clear

# ── Permissions ──────────────────────────────────────────
RUN chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# ── Firebase credentials from env at runtime ─────────────
# (handled by entrypoint.sh)
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
