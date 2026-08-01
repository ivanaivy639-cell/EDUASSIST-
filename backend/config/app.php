<?php

return [

    'name' => env('APP_NAME', 'EduAssist'),

    'env' => env('APP_ENV', 'production'),

    'debug' => (bool) env('APP_DEBUG', true),

    'url' => env('APP_URL', 'http://localhost'),

    'timezone' => env('APP_TIMEZONE', 'UTC'),

    'locale' => env('APP_LOCALE', 'fr'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'fr'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'fr_FR'),

    'cipher' => 'AES-256-CBC',

    'key' => (env('APP_KEY') && str_starts_with(env('APP_KEY'), 'base64:'))
        ? env('APP_KEY')
        : 'base64:X7vN2wK5xR9zQ1wP8sM3tU6vX0yA5bC2dE8fG1hI4jK=',

    'previous_keys' => [
        ...array_filter(
            explode(',', env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    'maintenance' => [
        'driver' => 'file',
        'store' => 'database',
    ],

];
