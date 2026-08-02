<?php

namespace App\Http\Controllers\Ai;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ai\GenerateContentRequest;
use App\Models\AiConversation;
use App\Models\AiMessage;
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

        $validated = $request->validated();

        // Resolve or create conversation
        $conversationId = $validated['conversation_id'] ?? null;
        $conversation = null;

        if ($conversationId) {
            $conversation = AiConversation::where('user_id', $request->user()->id)
                ->find($conversationId);
        }

        // Construction d'un titre explicite avec le type, le thème saisi et la classe
        $typeLabel = match ($validated['type'] ?? 'lesson_plan') {
            'lesson_plan' => 'Fiche de cours',
            'exercise'    => 'Exercices',
            'quiz'        => 'Quiz',
            'summary'     => 'Résumé',
            'correction'  => 'Corrigé',
            default       => 'Document',
        };

        $themeInput = !empty($validated['theme']) ? trim($validated['theme']) : (trim($validated['message'] ?? ''));
        $niveauInput = !empty($validated['niveau']) ? trim($validated['niveau']) : '';

        $titleParts = [$typeLabel];
        if ($themeInput) {
            $titleParts[] = mb_substr($themeInput, 0, 50);
        }
        if ($niveauInput) {
            $titleParts[] = $niveauInput;
        }

        $computedTitle = implode(' — ', $titleParts);

        if (!$conversation) {
            $conversation = AiConversation::create([
                'user_id'    => $request->user()->id,
                'course_id'  => $validated['course_id'] ?? null,
                'chapter_id' => $validated['chapter_id'] ?? null,
                'lesson_id'  => $validated['lesson_id'] ?? null,
                'title'      => $computedTitle,
            ]);
        } else {
            $conversation->update(['title' => $computedTitle]);
        }

        if (empty($validated['message'])) {
            $msgParts = [];
            if (!empty($validated['theme'])) {
                $msgParts[] = "Thème : " . $validated['theme'];
            }
            if (!empty($validated['matiere'])) {
                $msgParts[] = "Matière : " . $validated['matiere'];
            }
            if (!empty($validated['niveau'])) {
                $msgParts[] = "Niveau / Classe : " . $validated['niveau'];
            }
            if (!empty($validated['duree'])) {
                $msgParts[] = "Durée : " . $validated['duree'];
            }
            if (!empty($validated['objectifs'])) {
                $msgParts[] = "Objectifs : " . $validated['objectifs'];
            }
            if (!empty($validated['consignes'])) {
                $msgParts[] = "Consignes : " . $validated['consignes'];
            }

            $validated['message'] = count($msgParts) > 0
                ? "Générer " . $typeLabel . " :\n" . implode("\n", $msgParts)
                : "Générer " . $typeLabel;
        }

        // Save user message
        AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $validated['message'],
        ]);

        // Generate AI response
        $result = $this->aiService->generate($teacher, $validated);

        // Save AI response
        AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'model',
            'content' => $result['content'],
        ]);

        // Auto-generate title from first user message
        if ($conversation->title === 'Nouvelle conversation') {
            $conversation->generateTitle();
            $conversation->refresh();
        }

        // Touch updated_at
        $conversation->touch();

        return response()->json([
            'success' => true,
            'message' => 'Ressource generee avec succes.',
            'data' => array_merge($result, [
                'conversation_id' => $conversation->id,
                'conversation_title' => $conversation->title,
            ]),
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
