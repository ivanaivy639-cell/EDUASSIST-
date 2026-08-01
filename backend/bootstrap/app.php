<?php
/*
 * Depuis Laravel 11, il n'y a plus de app/Http/Kernel.php ni de
 * routes/api.php chargé automatiquement. Il faut le déclarer explicitement
 * dans bootstrap/app.php.
 *
 * Ci-dessous, un extrait à FUSIONNER avec votre bootstrap/app.php existant
 * (n'écrasez pas le fichier, copiez seulement les parties pertinentes).
 */

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // <-- indispensable pour charger routes/api.php
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Sanctum : nécessaire seulement si vous consommez l'API depuis un
        // frontend SPA sur le même domaine (cookies). Pour une auth par
        // Bearer Token (mobile, apps tierces), rien à ajouter ici : le
        // middleware "auth:sanctum" utilisé dans routes/api.php suffit.
        //
        // $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->reportable(function (\Throwable $e) {
            error_log('LARAVEL UNCAUGHT EXCEPTION: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
        });
    })->create();
