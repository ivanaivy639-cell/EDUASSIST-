<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    /**
     * Lister tous les examens de l'enseignant connecté.
     */
    public function index(Request $request): JsonResponse
    {
        $teacher = $request->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis.',
            ], 403);
        }

        $exams = Exam::where('teacher_id', $teacher->id)
            ->withCount('submissions')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($exam) {
                return [
                    'id'                => $exam->id,
                    'title'             => $exam->title,
                    'token'             => $exam->token,
                    'public_url'        => $exam->public_url,
                    'duration_minutes'  => $exam->duration_minutes,
                    'max_score'         => $exam->max_score,
                    'is_active'         => $exam->is_active,
                    'exam_date'         => $exam->exam_date ? $exam->exam_date->toDateString() : null,
                    'start_time'        => $exam->start_time,
                    'end_time'          => $exam->end_time,
                    'starts_at'         => $exam->starts_at?->toISOString(),
                    'ends_at'           => $exam->ends_at?->toISOString(),
                    'submissions_count' => $exam->submissions_count,
                    'graded_count'      => $exam->graded_count,
                    'average_score'     => $exam->average_score,
                    'created_at'        => $exam->created_at->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $exams,
        ]);
    }

    /**
     * Créer un nouvel examen.
     */
    public function store(Request $request): JsonResponse
    {
        $teacher = $request->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis.',
            ], 403);
        }

        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'content'          => 'required|string',
            'answer_key'       => 'nullable|string',
            'duration_minutes' => 'required|integer|min:5|max:480',
            'max_score'        => 'nullable|integer|min:1',
            'course_id'        => 'nullable|integer',
            'is_active'        => 'nullable|boolean',
            'exam_date'        => 'nullable|date',
            'start_time'       => 'nullable|date_format:H:i',
            'end_time'         => 'nullable|date_format:H:i|after:start_time',
            'starts_at'        => 'nullable|date',
            'ends_at'          => 'nullable|date|after_or_equal:starts_at',
            'settings'         => 'nullable|array',
        ]);

        $startsAt = null;
        $endsAt = null;

        if (!empty($validated['exam_date'])) {
            $examDate = $validated['exam_date'];
            if (!empty($validated['start_time'])) {
                try {
                    $startsAt = \Carbon\Carbon::createFromFormat('Y-m-d H:i', "{$examDate} {$validated['start_time']}", 'Africa/Douala')->utc();
                } catch (\Exception $e) {}
            }
            if (!empty($validated['end_time'])) {
                try {
                    $endsAt = \Carbon\Carbon::createFromFormat('Y-m-d H:i', "{$examDate} {$validated['end_time']}", 'Africa/Douala')->utc();
                } catch (\Exception $e) {}
            }
        }

        $exam = Exam::create([
            'teacher_id'       => $teacher->id,
            'course_id'        => $validated['course_id'] ?? null,
            'title'            => $validated['title'],
            'content'          => $validated['content'],
            'answer_key'       => $validated['answer_key'] ?? null,
            'token'            => Exam::generateToken(),
            'duration_minutes' => $validated['duration_minutes'],
            'max_score'        => $validated['max_score'] ?? 20,
            'is_active'        => $validated['is_active'] ?? true,
            'exam_date'        => $validated['exam_date'] ?? null,
            'start_time'       => $validated['start_time'] ?? null,
            'end_time'         => $validated['end_time'] ?? null,
            'starts_at'        => $startsAt,
            'ends_at'          => $endsAt,
            'settings'         => $validated['settings'] ?? [
                'max_tab_switches'   => 2,
                'require_fullscreen' => true,
                'block_copy_paste'   => true,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Examen créé avec succès.',
            'data'    => [
                'id'         => $exam->id,
                'title'      => $exam->title,
                'token'      => $exam->token,
                'public_url' => $exam->public_url,
                'duration_minutes' => $exam->duration_minutes,
                'max_score'  => $exam->max_score,
                'created_at' => $exam->created_at->toISOString(),
            ],
        ], 201);
    }

    /**
     * Voir le détail d'un examen avec ses soumissions.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $teacher = $request->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis.',
            ], 403);
        }

        $exam = Exam::where('teacher_id', $teacher->id)
            ->with(['submissions' => function ($q) {
                $q->orderByDesc('submitted_at');
            }])
            ->find($id);

        if (!$exam) {
            return response()->json([
                'success' => false,
                'message' => 'Examen non trouvé.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'exam'        => [
                    'id'               => $exam->id,
                    'title'            => $exam->title,
                    'content'          => $exam->content,
                    'answer_key'       => $exam->answer_key,
                    'token'            => $exam->token,
                    'public_url'       => $exam->public_url,
                    'duration_minutes' => $exam->duration_minutes,
                    'max_score'        => $exam->max_score,
                    'is_active'        => $exam->is_active,
                    'exam_date'        => $exam->exam_date ? $exam->exam_date->toDateString() : null,
                    'start_time'       => $exam->start_time,
                    'end_time'         => $exam->end_time,
                    'starts_at'        => $exam->starts_at?->toISOString(),
                    'ends_at'          => $exam->ends_at?->toISOString(),
                    'created_at'       => $exam->created_at->toISOString(),
                ],
                'submissions' => $exam->submissions->map(function ($sub) {
                    return [
                        'id'                => $sub->id,
                        'student_name'      => $sub->student_name,
                        'student_matricule' => $sub->student_matricule,
                        'score'             => $sub->score,
                        'max_score'         => $sub->max_score,
                        'status'            => $sub->status,
                        'tab_switches'      => $sub->tab_switches,
                        'is_auto_submitted' => $sub->is_auto_submitted,
                        'ai_feedback'       => $sub->ai_feedback,
                        'answers'           => $sub->answers,
                        'started_at'        => $sub->started_at?->toISOString(),
                        'submitted_at'      => $sub->submitted_at?->toISOString(),
                    ];
                }),
                'stats' => [
                    'total_submissions' => $exam->submissions->count(),
                    'graded'            => $exam->submissions->where('status', 'graded')->count(),
                    'in_progress'       => $exam->submissions->where('status', 'in_progress')->count(),
                    'disqualified'      => $exam->submissions->where('status', 'disqualified')->count(),
                    'average_score'     => $exam->submissions->where('status', 'graded')->avg('score'),
                    'max_achieved'      => $exam->submissions->where('status', 'graded')->max('score'),
                    'min_achieved'      => $exam->submissions->where('status', 'graded')->min('score'),
                ],
            ],
        ]);
    }

    /**
     * Modifier un examen (activer/désactiver, changer durée...).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $teacher = $request->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis.',
            ], 403);
        }

        $exam = Exam::where('teacher_id', $teacher->id)->find($id);

        if (!$exam) {
            return response()->json([
                'success' => false,
                'message' => 'Examen non trouvé.',
            ], 404);
        }

        $validated = $request->validate([
            'title'            => 'sometimes|string|max:255',
            'is_active'        => 'sometimes|boolean',
            'duration_minutes' => 'sometimes|integer|min:5|max:480',
            'max_score'        => 'sometimes|integer|min:1|max:100',
            'starts_at'        => 'nullable|date',
            'ends_at'          => 'nullable|date',
            'exam_date'        => 'nullable|date',
            'start_time'       => 'nullable|date_format:H:i|date_format:H:i:s',
            'end_time'         => 'nullable|date_format:H:i|date_format:H:i:s',
        ]);

        $exam->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Examen mis à jour.',
            'data'    => [
                'id'         => $exam->id,
                'title'      => $exam->title,
                'is_active'  => $exam->is_active,
                'public_url' => $exam->public_url,
            ],
        ]);
    }

    /**
     * Supprimer un examen.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $teacher = $request->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis.',
            ], 403);
        }

        $exam = Exam::where('teacher_id', $teacher->id)->find($id);

        if (!$exam) {
            return response()->json([
                'success' => false,
                'message' => 'Examen non trouvé.',
            ], 404);
        }

        $exam->delete();

        return response()->json([
            'success' => true,
            'message' => 'Examen supprimé.',
        ]);
    }

    /**
     * Résultats détaillés d'un examen.
     */
    public function results(Request $request, int $id): JsonResponse
    {
        $teacher = $request->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis.',
            ], 403);
        }

        $exam = Exam::where('teacher_id', $teacher->id)
            ->with('submissions')
            ->find($id);

        if (!$exam) {
            return response()->json([
                'success' => false,
                'message' => 'Examen non trouvé.',
            ], 404);
        }

        $gradedSubmissions = $exam->submissions->where('status', 'graded');
        $scores = $gradedSubmissions->pluck('score')->filter()->values();

        // Histogramme des notes (tranches de 2 points)
        $histogram = [];
        for ($i = 0; $i <= $exam->max_score; $i += 2) {
            $range = $i . '-' . min($i + 2, $exam->max_score);
            $histogram[$range] = $scores->filter(function ($s) use ($i) {
                return $s >= $i && $s < $i + 2;
            })->count();
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'exam'    => [
                    'id'               => $exam->id,
                    'title'            => $exam->title,
                    'max_score'        => $exam->max_score,
                    'duration_minutes' => $exam->duration_minutes,
                ],
                'stats'   => [
                    'total'         => $exam->submissions->count(),
                    'graded'        => $gradedSubmissions->count(),
                    'in_progress'   => $exam->submissions->where('status', 'in_progress')->count(),
                    'disqualified'  => $exam->submissions->where('status', 'disqualified')->count(),
                    'average'       => $scores->isNotEmpty() ? round($scores->avg(), 2) : null,
                    'median'        => $scores->isNotEmpty() ? round($scores->median(), 2) : null,
                    'max_achieved'  => $scores->max(),
                    'min_achieved'  => $scores->min(),
                    'pass_rate'     => $scores->isNotEmpty()
                        ? round($scores->filter(fn($s) => $s >= ($exam->max_score / 2))->count() / $scores->count() * 100, 1)
                        : null,
                    'histogram'     => $histogram,
                ],
                'submissions' => $exam->submissions->map(function ($sub) {
                    return [
                        'id'                => $sub->id,
                        'student_name'      => $sub->student_name,
                        'student_matricule' => $sub->student_matricule,
                        'score'             => $sub->score,
                        'max_score'         => $sub->max_score,
                        'status'            => $sub->status,
                        'tab_switches'      => $sub->tab_switches,
                        'is_auto_submitted' => $sub->is_auto_submitted,
                        'ai_feedback'       => $sub->ai_feedback,
                        'answers'           => $sub->answers,
                        'started_at'        => $sub->started_at?->toISOString(),
                        'submitted_at'      => $sub->submitted_at?->toISOString(),
                    ];
                })->sortByDesc('score')->values(),
            ],
        ]);
    }
}
