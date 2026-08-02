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

        Route::get('/documents', [\App\Http\Controllers\DocumentController::class, 'index']);

        Route::prefix('ai')->group(function () {
            Route::post('/generate', [AiController::class, 'generate']);
            Route::get('/agents', [AiController::class, 'agents']);
        });

        Route::prefix('classes')->group(function () {
            Route::get('/', [\App\Http\Controllers\ClassCourseController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\ClassCourseController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\ClassCourseController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\ClassCourseController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\ClassCourseController::class, 'destroy']);

            // Cours d'une classe
            Route::get('/{id}/courses/{courseId}', [\App\Http\Controllers\ClassCourseController::class, 'showCourse']);
            Route::post('/{id}/courses', [\App\Http\Controllers\ClassCourseController::class, 'storeCourse']);
            Route::put('/{id}/courses/{courseId}', [\App\Http\Controllers\ClassCourseController::class, 'updateCourse']);
            Route::delete('/{id}/courses/{courseId}', [\App\Http\Controllers\ClassCourseController::class, 'destroyCourse']);

            // Chapitres d'un cours
            Route::post('/{id}/courses/{courseId}/chapters', [\App\Http\Controllers\ClassCourseController::class, 'storeChapter']);
            Route::delete('/{id}/courses/{courseId}/chapters/{chapterId}', [\App\Http\Controllers\ClassCourseController::class, 'destroyChapter']);

            // Leçons d'un chapitre
            Route::post('/{id}/courses/{courseId}/chapters/{chapterId}/lessons', [\App\Http\Controllers\ClassCourseController::class, 'storeLesson']);
            Route::delete('/{id}/courses/{courseId}/chapters/{chapterId}/lessons/{lessonId}', [\App\Http\Controllers\ClassCourseController::class, 'destroyLesson']);
        });

        // ── Gestion des examens (Espace Enseignant) ────────────────
        Route::prefix('exams')->group(function () {
            Route::get('/', [\App\Http\Controllers\Exam\ExamController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Exam\ExamController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\Exam\ExamController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Exam\ExamController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\Exam\ExamController::class, 'destroy']);
            Route::get('/{id}/results', [\App\Http\Controllers\Exam\ExamController::class, 'results']);
        });
    });

});
