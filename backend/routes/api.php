<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Ai\AiController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Teacher\TeacherController;

Route::prefix('v1')->group(function () {

    // Routes publiques
    Route::prefix('auth')->group(function () {
        Route::post('/google', [GoogleAuthController::class, 'login']);
    });

    // Routes protegees par Sanctum
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [GoogleAuthController::class, 'logout']);

        Route::prefix('enseignants')->group(function () {
            Route::get('/me', [TeacherController::class, 'show']);
            Route::post('/register', [TeacherController::class, 'store']);
        });

        Route::prefix('ai')->group(function () {
            Route::post('/generate', [AiController::class, 'generate']);
            Route::get('/agents', [AiController::class, 'agents']);
        });

        Route::prefix('classes')->group(function () {
            Route::get('/', [\App\Http\Controllers\ClassCourseController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\ClassCourseController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\ClassCourseController::class, 'show']);
            Route::post('/{id}/courses', [\App\Http\Controllers\ClassCourseController::class, 'storeCourse']);
        });
    });

});
