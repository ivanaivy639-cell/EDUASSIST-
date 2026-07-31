<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Exam\ExamPublicController;

Route::get('/', function () {
    return response()->json([
        'app' => 'Laravel Firebase Auth API',
        'version' => '1.0.0',
        'status' => 'running',
    ]);
});

// ── Évaluations publiques (étudiants) ──────────────────────
Route::get('/exam/{token}', function ($token, \Illuminate\Http\Request $request) {
    if ($request->query('submitted')) {
        return view('exam.exam-submitted');
    }
    return app(ExamPublicController::class)->show($token);
});
Route::post('/exam/{token}/start', [ExamPublicController::class, 'start']);
Route::post('/exam/{token}/submit', [ExamPublicController::class, 'submit']);
Route::post('/exam/{token}/heartbeat', [ExamPublicController::class, 'heartbeat']);
