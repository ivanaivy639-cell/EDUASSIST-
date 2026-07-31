<?php

namespace App\Http\Controllers\Ai;

use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiConversationController extends Controller
{
    /**
     * Liste des conversations de l'utilisateur (les plus récentes d'abord).
     */
    public function index(Request $request): JsonResponse
    {
        $query = AiConversation::where('user_id', $request->user()->id);

        $lessonId = $request->lesson_id;
        $chapterId = $request->chapter_id;
        $courseId = $request->course_id;

        if ($lessonId === 'undefined' || $lessonId === 'null') $lessonId = null;
        if ($chapterId === 'undefined' || $chapterId === 'null') $chapterId = null;
        if ($courseId === 'undefined' || $courseId === 'null') $courseId = null;

        if (!empty($lessonId)) {
            $query->where('lesson_id', $lessonId);
        } elseif (!empty($chapterId)) {
            $query->where('chapter_id', $chapterId);
        } elseif (!empty($courseId)) {
            $query->where('course_id', $courseId)
                  ->whereNull('chapter_id')
                  ->whereNull('lesson_id');
        } else {
            $query->whereNull('course_id')
                  ->whereNull('chapter_id')
                  ->whereNull('lesson_id');
        }

        $conversations = $query->orderByDesc('updated_at')
            ->select(['id', 'title', 'created_at', 'updated_at'])
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $conversations,
        ]);
    }

    /**
     * Messages d'une conversation.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $conversation = AiConversation::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $messages = $conversation->messages()
            ->select(['id', 'role', 'content', 'created_at'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'conversation' => [
                    'id' => $conversation->id,
                    'title' => $conversation->title,
                    'created_at' => $conversation->created_at,
                    'updated_at' => $conversation->updated_at,
                ],
                'messages' => $messages,
            ],
        ]);
    }

    /**
     * Créer une nouvelle conversation vide.
     */
    public function store(Request $request): JsonResponse
    {
        $conversation = AiConversation::create([
            'user_id' => $request->user()->id,
            'course_id' => $request->course_id,
            'title' => 'Nouvelle conversation',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'created_at' => $conversation->created_at,
                'updated_at' => $conversation->updated_at,
            ],
        ], 201);
    }

    /**
     * Supprimer une conversation et ses messages.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $conversation = AiConversation::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $conversation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Conversation supprimée.',
        ]);
    }
}
