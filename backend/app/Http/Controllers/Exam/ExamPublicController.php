<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamSubmission;
use App\Services\ExamCorrectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ExamPublicController extends Controller
{
    public function __construct(
        private ExamCorrectionService $correctionService
    ) {}

    public function apiStatus()
    {
        return response()->json([
            'app' => 'Laravel Firebase Auth API',
            'version' => '1.0.0',
            'status' => 'running',
        ]);
    }

    /**
     * Entry route for public exam page.
     * GET /exam/{token}
     */
    public function showPage(Request $request, string $token)
    {
        if ($request->query('submitted')) {
            return view('exam.exam-submitted');
        }
        return $this->show($token);
    }

    /**
     * Afficher la page d'identification de l'étudiant.
     * GET /exam/{token}
     */
    public function show(string $token)
    {
        try {
            $exam = Exam::where('token', trim($token))->first();

            if (!$exam) {
                return view('exam.exam-closed', [
                    'reason' => 'not_found',
                    'message' => 'Cet examen n\'existe pas ou le lien est invalide.',
                ]);
            }

            $now = now();
            
            if ($exam->starts_at && $now->lt($exam->starts_at)) {
                $dateStr = $exam->starts_at instanceof \Carbon\Carbon 
                    ? $exam->starts_at->format('d/m/Y à H:i') 
                    : (string) $exam->starts_at;
                return view('exam.exam-closed', [
                    'reason' => 'not_started',
                    'message' => 'L\'examen n\'a pas encore commencé. Il sera disponible le ' . $dateStr . '.',
                ]);
            }
            
            if ($exam->ends_at && $now->gt($exam->ends_at)) {
                $dateStr = $exam->ends_at instanceof \Carbon\Carbon 
                    ? $exam->ends_at->format('d/m/Y à H:i') 
                    : (string) $exam->ends_at;
                return view('exam.exam-closed', [
                    'reason' => 'ended',
                    'message' => 'L\'examen est terminé depuis le ' . $dateStr . '.',
                ]);
            }

            if (!$exam->isAccessible()) {
                return view('exam.exam-closed', [
                    'reason' => 'closed',
                    'message' => 'Cet examen n\'est plus disponible.',
                ]);
            }

            $teacher = $exam->teacher;

            return view('exam.exam-login', [
                'exam'         => $exam,
                'teacher_name' => $teacher ? "{$teacher->nom} {$teacher->prenom}" : 'Enseignant',
            ]);
        } catch (\Throwable $e) {
            Log::error('ExamPublicController@show failed', [
                'token' => $token,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->view('exam.exam-closed', [
                'reason'  => 'error',
                'message' => 'Erreur lors du chargement de l\'examen : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Démarrer la composition.
     * POST /exam/{token}/start
     */
    public function start(Request $request, string $token)
    {
        try {
            $exam = Exam::where('token', trim($token))->first();

            if (!$exam) {
                return view('exam.exam-closed', [
                    'reason' => 'not_found',
                    'message' => 'Cet examen n\'existe pas ou le lien est invalide.',
                ]);
            }

            $now = now();
            
            if ($exam->starts_at && $now->lt($exam->starts_at)) {
                $dateStr = $exam->starts_at instanceof \Carbon\Carbon 
                    ? $exam->starts_at->format('d/m/Y à H:i') 
                    : (string) $exam->starts_at;
                return view('exam.exam-closed', [
                    'reason' => 'not_started',
                    'message' => 'L\'examen n\'a pas encore commencé. Il sera disponible le ' . $dateStr . '.',
                ]);
            }
            
            if ($exam->ends_at && $now->gt($exam->ends_at)) {
                $dateStr = $exam->ends_at instanceof \Carbon\Carbon 
                    ? $exam->ends_at->format('d/m/Y à H:i') 
                    : (string) $exam->ends_at;
                return view('exam.exam-closed', [
                    'reason' => 'ended',
                    'message' => 'L\'examen est terminé depuis le ' . $dateStr . '.',
                ]);
            }

            if (!$exam->isAccessible()) {
                return view('exam.exam-closed', [
                    'reason' => 'closed',
                    'message' => 'Cet examen n\'est plus disponible.',
                ]);
            }

            $request->validate([
                'student_name'      => 'required|string|max:255',
                'student_matricule' => 'required|string|max:50',
            ]);

            $name      = trim($request->input('student_name'));
            $matricule = strtoupper(trim($request->input('student_matricule')));

            // Vérifier si cet étudiant a déjà une soumission
            $existing = ExamSubmission::where('exam_id', $exam->id)
                ->where('student_matricule', $matricule)
                ->first();

            if ($existing) {
                if ($existing->isSubmitted()) {
                    return view('exam.exam-closed', [
                        'reason'  => 'already_submitted',
                        'message' => 'Vous avez déjà composé cet examen. Vous ne pouvez pas le refaire.',
                    ]);
                }

                // Si la soumission est encore en cours et pas expirée, reprendre
                if (!$existing->isExpired()) {
                    return view('exam.exam-compose', [
                        'exam'         => $exam,
                        'submission'   => $existing,
                        'remaining'    => $existing->remaining_seconds,
                        'content_html' => $this->markdownToHtml($exam->content),
                    ]);
                }

                // Soumission expirée, la fermer
                $existing->update([
                    'status'            => 'expired',
                    'is_auto_submitted' => true,
                    'submitted_at'      => now(),
                ]);

                // Déclencher la correction IA
                try {
                    $this->correctionService->grade($existing);
                } catch (\Throwable $e) {
                    Log::error('Auto-correction failed on start: ' . $e->getMessage());
                }

                return view('exam.exam-closed', [
                    'reason'  => 'expired',
                    'message' => 'Le temps de votre épreuve est écoulé. Votre copie a été soumise automatiquement.',
                ]);
            }

            // Créer la soumission
            $submission = ExamSubmission::create([
                'exam_id'           => $exam->id,
                'student_name'      => $name,
                'student_matricule' => $matricule,
                'max_score'         => $exam->max_score,
                'started_at'        => now(),
                'ip_address'        => $request->ip(),
                'user_agent'        => $request->userAgent(),
                'status'            => 'in_progress',
            ]);

            Log::info('Exam started', [
                'exam_id'    => $exam->id,
                'student'    => $name,
                'matricule'  => $matricule,
                'ip_address' => $request->ip(),
            ]);

            return view('exam.exam-compose', [
                'exam'         => $exam,
                'submission'   => $submission,
                'remaining'    => $exam->duration_minutes * 60,
                'content_html' => $this->markdownToHtml($exam->content),
            ]);
        } catch (\Throwable $e) {
            Log::error('ExamPublicController@start failed', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);

            return response()->view('exam.exam-closed', [
                'reason'  => 'error',
                'message' => 'Erreur lors du démarrage de l\'examen : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Soumettre les réponses.
     * POST /exam/{token}/submit
     */
    public function submit(Request $request, string $token)
    {
        $exam = Exam::where('token', $token)->first();

        if (!$exam) {
            return response()->json([
                'success' => false,
                'message' => 'Examen non trouvé.',
            ], 404);
        }

        $request->validate([
            'submission_id' => 'required|integer',
            'answers'       => 'nullable|string',
            'tab_switches'  => 'nullable|integer|min:0',
            'auto_submit'   => 'nullable|boolean',
        ]);

        $submission = ExamSubmission::where('id', $request->input('submission_id'))
            ->where('exam_id', $exam->id)
            ->first();

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Soumission non trouvée.',
            ], 404);
        }

        if ($submission->isSubmitted()) {
            return response()->json([
                'success' => false,
                'message' => 'Cette copie a déjà été soumise.',
            ], 409);
        }

        $autoSubmit  = $request->boolean('auto_submit', false);
        $tabSwitches = $request->integer('tab_switches', 0);
        $maxSwitches = $exam->settings['max_tab_switches'] ?? 2;

        // Déterminer le statut
        $status = 'submitted';
        if ($tabSwitches > $maxSwitches) {
            $status = 'disqualified';
        }

        $submission->update([
            'answers'           => $request->input('answers', ''),
            'tab_switches'      => $tabSwitches,
            'is_auto_submitted' => $autoSubmit,
            'submitted_at'      => now(),
            'status'            => $status,
        ]);

        Log::info('Exam submitted', [
            'exam_id'       => $exam->id,
            'submission_id' => $submission->id,
            'student'       => $submission->student_name,
            'auto_submit'   => $autoSubmit,
            'tab_switches'  => $tabSwitches,
            'status'        => $status,
        ]);

        // Déclencher la correction IA
        try {
            $this->correctionService->grade($submission);
        } catch (\Throwable $e) {
            Log::error('Auto-correction failed', [
                'submission_id' => $submission->id,
                'error'         => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Votre copie a été soumise avec succès.',
            'data'    => [
                'status' => $status,
            ],
        ]);
    }

    /**
     * Heartbeat — signal de vie pour vérifier le temps restant.
     * POST /exam/{token}/heartbeat
     */
    public function heartbeat(Request $request, string $token)
    {
        $exam = Exam::where('token', $token)->first();

        if (!$exam) {
            return response()->json(['expired' => true, 'remaining' => 0]);
        }

        $submission = ExamSubmission::where('exam_id', $exam->id)
            ->where('id', $request->input('submission_id'))
            ->first();

        if (!$submission) {
            return response()->json(['expired' => true, 'remaining' => 0]);
        }

        if ($submission->isSubmitted()) {
            return response()->json(['expired' => true, 'remaining' => 0, 'already_submitted' => true]);
        }

        $remaining = $submission->remaining_seconds;

        // Si le temps est écoulé, auto-soumettre
        if ($remaining <= 0) {
            $submission->update([
                'status'            => 'expired',
                'is_auto_submitted' => true,
                'submitted_at'      => now(),
            ]);

            try {
                $this->correctionService->grade($submission);
            } catch (\Throwable $e) {
                Log::error('Auto-correction on heartbeat failed', [
                    'submission_id' => $submission->id,
                    'error'         => $e->getMessage(),
                ]);
            }

            return response()->json(['expired' => true, 'remaining' => 0]);
        }

        // Sauvegarder le nombre de tab switches si fourni
        if ($request->has('tab_switches')) {
            $submission->update(['tab_switches' => $request->integer('tab_switches')]);
        }

        return response()->json([
            'expired'   => false,
            'remaining' => $remaining,
        ]);
    }

    /**
     * Convertit le Markdown en HTML via Parsedown.
     */
    private function markdownToHtml(string $markdown): string
    {
        // Supprimer la section corrigé du contenu visible
        $parts = preg_split('/\[SECTION_CORRIGE\]/i', $markdown, 2);
        $content = $parts[0] ?? $markdown;

        try {
            if (class_exists(\Parsedown::class)) {
                $parsedown = new \Parsedown();
                $parsedown->setSafeMode(true);
                return $parsedown->text($content);
            }
        } catch (\Throwable $e) {
            Log::warning('Parsedown conversion failed: ' . $e->getMessage());
        }

        return nl2br(e($content));
    }
}
