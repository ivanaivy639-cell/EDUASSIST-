<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\RegisterTeacherRequest;
use App\Http\Requests\Teacher\UpdateTeacherRequest;
use App\Http\Resources\TeacherResource;
use App\Services\TeacherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class TeacherController extends Controller
{
    public function __construct(
        private TeacherService $teacherService
    ) {}

    public function show(): JsonResponse
    {
        $user = auth()->user();
        $teacher = $this->teacherService->getProfile($user);

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant introuvable.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new TeacherResource($teacher),
        ]);
    }

    public function store(RegisterTeacherRequest $request): JsonResponse
    {
        try {
            $user = auth()->user();

            $teacher = $this->teacherService->createProfile($user, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Profil cree avec succes.',
                'data' => new TeacherResource($teacher),
            ], 201);

        } catch (\Exception $e) {
            if ($e->getMessage() === 'Un profil enseignant existe deja.') {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 409);
            }

            Log::error('Teacher creation failed', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la creation du profil.',
            ], 500);
        }
    }
}
