<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Exam\ExamPublicController;

Route::get('/', [ExamPublicController::class, 'apiStatus']);

// ── Évaluations publiques (étudiants) ──────────────────────
Route::get('/exam/{token}', [ExamPublicController::class, 'showPage']);
Route::post('/exam/{token}/start', [ExamPublicController::class, 'start']);
Route::post('/exam/{token}/submit', [ExamPublicController::class, 'submit']);
Route::post('/exam/{token}/heartbeat', [ExamPublicController::class, 'heartbeat']);
