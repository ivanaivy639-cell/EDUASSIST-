<?php

return [
    /*
     * The web client runs on a different port from Laravel during development.
     * Bearer-token authentication does not require cookies, so credentials stay
     * disabled while the Authorization header remains allowed.
     */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:8082'))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
