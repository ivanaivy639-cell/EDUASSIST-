<?php

namespace App\Http\Controllers\Ai;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ai\GenerateContentRequest;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;

class AiController extends Controller
{
    public function __construct(
        private AiService $aiService
    ) {}

    public function generate(GenerateContentRequest $request): JsonResponse
    {
        $teacher = $request->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis pour utiliser le module IA.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ressource generee avec succes.',
            'data' => $this->aiService->generate($teacher, $request->validated()),
        ]);
    }

    public function agents(): JsonResponse
    {
        $teacher = request()->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis pour utiliser le module IA.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $this->aiService->availableAgents($teacher),
        ]);
    }
}
