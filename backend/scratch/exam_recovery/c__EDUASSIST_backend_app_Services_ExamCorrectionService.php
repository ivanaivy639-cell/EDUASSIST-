<?php

namespace App\Services;

use App\Models\ExamSubmission;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExamCorrectionService
{
    /**
     * Corrige automatiquement une soumission d'examen via l'IA Groq.
     */
    public function grade(ExamSubmission $submission): bool
    {
        $exam = $submission->exam;

        if (!$exam) {
            Log::error('ExamCorrectionService: exam not found', ['submission_id' => $submission->id]);
            return false;
        }

        $apiKey = config('ai.groq.api_key');

        if (!$apiKey) {
            Log::warning('ExamCorrectionService: GROQ_API_KEY manquant');
            return false;
        }

        try {
            $prompt = $this->buildCorrectionPrompt($exam, $submission);

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type'  => 'application/json',
                ])
                ->timeout(90)
                ->post(config('ai.groq.endpoint'), [
                    'model'       => config('ai.groq.default_model', 'llama-3.1-8b-instant'),
                    'messages'    => [
                        [
                            'role'    => 'system',
                            'content' => $this->systemPrompt(),
                        ],
                        [
                            'role'    => 'user',
                            'content' => $prompt,
                        ],
                    ],
                    'temperature' => 0.3, // Plus déterministe pour la correction
                    'max_tokens'  => 4096,
                ]);

            if (!$response->successful()) {
                Log::warning('ExamCorrectionService: Groq request failed', [
                    'status'        => $response->status(),
                    'submission_id' => $submission->id,
                ]);
                return false;
            }

            $content = trim($response->json('choices.0.message.content', ''));

            if (empty($content)) {
                Log::warning('ExamCorrectionService: empty response from Groq');
                return false;
            }

            // Extraire la note et le feedback
            $result = $this->parseGradingResult($content, $exam->max_score);

            $submission->update([
                'score'       => $result['score'],
                'ai_feedback' => $result['feedback'],
                'status'      => 'graded',
            ]);

            Log::info('ExamCorrectionService: graded successfully', [
                'submission_id' => $submission->id,
                'score'         => $result['score'],
                'max_score'     => $exam->max_score,
            ]);

            return true;

        } catch (\Throwable $e) {
            Log::error('ExamCorrectionService: exception', [
                'error'         => $e->getMessage(),
                'submission_id' => $submission->id,
            ]);
            return false;
        }
    }

    /**
     * Prompt système pour le correcteur IA.
     */
    private function systemPrompt(): string
    {
        return implode("\n", [
            'Tu es un correcteur d\'examens professionnel et rigoureux.',
            'Tu dois corriger la copie d\'un étudiant en te basant STRICTEMENT sur le corrigé type fourni par le professeur.',
            '',
            '=== RÈGLES DE CORRECTION ===',
            '1. Compare chaque réponse de l\'étudiant avec le corrigé type.',
            '2. Attribue des points partiels si la réponse est partiellement correcte.',
            '3. Sois juste et objectif : ne sois ni trop sévère, ni trop indulgent.',
            '4. Pour les questions ouvertes, évalue la pertinence, l\'exactitude et la complétude.',
            '5. Pour les calculs, vérifie chaque étape du raisonnement.',
            '',
            '=== FORMAT DE RÉPONSE OBLIGATOIRE ===',
            'Tu DOIS structurer ta réponse EXACTEMENT comme suit :',
            '',
            '[NOTE]',
            'XX/YY',
            '',
            '[DETAIL_CORRECTION]',
            '**Question 1** (X/Y pts) : Explication de la correction...',
            '**Question 2** (X/Y pts) : Explication de la correction...',
            '... (pour chaque question)',
            '',
            '[APPRECIATION_GENERALE]',
            'Commentaire global sur la copie de l\'étudiant.',
            '',
            'IMPORTANT : La note DOIT être un nombre décimal (ex: 14.5/20). Ne dépasse JAMAIS le barème maximal.',
        ]);
    }

    /**
     * Construit le prompt de correction avec l'épreuve, le corrigé et les réponses.
     */
    private function buildCorrectionPrompt($exam, ExamSubmission $submission): string
    {
        $lines = [
            '=== INFORMATIONS DE L\'ÉPREUVE ===',
            "Titre : {$exam->title}",
            "Barème total : {$exam->max_score} points",
            "Étudiant : {$submission->student_name} (Matricule: {$submission->student_matricule})",
            '',
        ];

        // Ajouter les infos de triche si pertinent
        if ($submission->tab_switches > 0) {
            $lines[] = "⚠️ ATTENTION : L'étudiant a quitté l'écran {$submission->tab_switches} fois pendant la composition.";
            $lines[] = '';
        }

        if ($submission->is_auto_submitted) {
            $lines[] = "⚠️ La copie a été soumise automatiquement (temps écoulé ou infraction).";
            $lines[] = '';
        }

        $lines = array_merge($lines, [
            '=== ÉNONCÉ DE L\'ÉPREUVE ===',
            $exam->content,
            '',
            '=== CORRIGÉ TYPE DU PROFESSEUR ===',
            $exam->answer_key ?? '(Aucun corrigé type fourni — corrige en te basant sur tes connaissances)',
            '',
            '=== RÉPONSES DE L\'ÉTUDIANT ===',
            $submission->answers ?? '(L\'étudiant n\'a rien écrit)',
            '',
            '=== CONSIGNE ===',
            "Corrige cette copie sur {$exam->max_score} points en suivant le format obligatoire [NOTE], [DETAIL_CORRECTION], [APPRECIATION_GENERALE].",
        ]);

        return implode("\n", $lines);
    }

    /**
     * Parse le résultat de la correction IA pour extraire la note et le feedback.
     */
    private function parseGradingResult(string $content, int $maxScore): array
    {
        $score = null;
        $feedback = $content; // Par défaut, tout le contenu est le feedback

        // Essayer d'extraire la note depuis la balise [NOTE]
        if (preg_match('/\[NOTE\]\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+)/i', $content, $matches)) {
            $score = (float) str_replace(',', '.', $matches[1]);
            // S'assurer que la note ne dépasse pas le maximum
            $score = min($score, $maxScore);
            $score = max(0, $score);
        }

        // Si pas de note trouvée, chercher d'autres patterns
        if ($score === null) {
            // Pattern: "Note : 14/20" ou "Note: 14.5/20"
            if (preg_match('/note\s*:\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+)/i', $content, $matches)) {
                $score = (float) str_replace(',', '.', $matches[1]);
                $score = min($score, $maxScore);
                $score = max(0, $score);
            }
        }

        // Si toujours pas de note, attribuer 0
        if ($score === null) {
            Log::warning('ExamCorrectionService: could not parse score from AI response');
            $score = 0;
        }

        return [
            'score'    => $score,
            'feedback' => $feedback,
        ];
    }
}
