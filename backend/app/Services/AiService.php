<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AiService
{
    private const TYPE_LABELS = [
        'lesson_plan' => 'fiche de preparation de lecon',
        'exercise'    => 'exercices corriges',
        'quiz'        => 'quiz rapide d evaluation',
        'correction'  => 'corrige type',
        'summary'     => 'resume de lecon',
    ];

    // Correspondance cycles scolaires camerounais (MINEDUB / MINESEC)
    private const CYCLES = [
        // Primaire (MINEDUB)
        'SIL'  => ['cycle' => 'primaire', 'sous_cycle' => 'CP1', 'ordre' => 1],
        'CP'   => ['cycle' => 'primaire', 'sous_cycle' => 'CP1', 'ordre' => 2],
        'CE1'  => ['cycle' => 'primaire', 'sous_cycle' => 'CP2', 'ordre' => 3],
        'CE2'  => ['cycle' => 'primaire', 'sous_cycle' => 'CP2', 'ordre' => 4],
        'CM1'  => ['cycle' => 'primaire', 'sous_cycle' => 'CM', 'ordre' => 5],
        'CM2'  => ['cycle' => 'primaire', 'sous_cycle' => 'CM', 'ordre' => 6],
        // College (MINESEC)
        '6eme' => ['cycle' => 'college', 'sous_cycle' => '1er cycle', 'ordre' => 7],
        '5eme' => ['cycle' => 'college', 'sous_cycle' => '1er cycle', 'ordre' => 8],
        '4eme' => ['cycle' => 'college', 'sous_cycle' => '1er cycle', 'ordre' => 9],
        '3eme' => ['cycle' => 'college', 'sous_cycle' => '2e cycle', 'ordre' => 10],
        // Lycee (MINESEC)
        '2nde' => ['cycle' => 'lycee', 'sous_cycle' => '2e cycle', 'ordre' => 11],
        '1ere' => ['cycle' => 'lycee', 'sous_cycle' => '2e cycle', 'ordre' => 12],
        'Tle'  => ['cycle' => 'lycee', 'sous_cycle' => '2e cycle', 'ordre' => 13],
    ];

    public function generate(Teacher $teacher, array $data): array
    {
        $apiKey = config('ai.gemini.api_key');

        if (!$apiKey) {
            Log::warning('GEMINI_API_KEY manquant, bascule sur mode local');
            return $this->buildLocalResponse($teacher, $data, true);
        }

        [$agentId, $model] = $this->resolveAgent($teacher->user, $data['agent'] ?? null);

        try {
            $endpoint = config('ai.gemini.endpoint') . '/models/' . rawurlencode($model) . ':generateContent';
            $url = $endpoint . '?' . http_build_query(['key' => $apiKey]);

            $response = Http::withoutVerifying()
                ->acceptJson()
                ->timeout((int) config('ai.gemini.timeout', 60))
                ->post($url, $this->geminiPayload($teacher, $data));

            if (!$response->successful()) {
                Log::warning('Gemini generation failed', [
                    'status'     => $response->status(),
                    'body'       => Str::limit($response->body(), 1000),
                    'agent'      => $agentId,
                    'model'      => $model,
                    'teacher_id' => $teacher->id,
                ]);
                return $this->buildLocalResponse($teacher, $data, true);
            }

            $content = trim($this->extractOutputText($response->json()));

            if ($content === '') {
                Log::warning('Gemini returned empty content', ['agent' => $agentId]);
                return $this->buildLocalResponse($teacher, $data, true);
            }

            return [
                'content'      => $content,
                'provider'     => 'gemini',
                'agent'        => $agentId,
                'model'        => $model,
                'fallback'     => false,
                'generated_at' => now()->toISOString(),
                'plan_cost'    => $this->getPlanPrice($teacher->user),
                'chat_cost'    => $this->calculateChatCost($agentId, strlen($content)),
            ];
        } catch (\Throwable $e) {
            Log::error('AI generation exception', [
                'error'      => $e->getMessage(),
                'agent'      => $agentId,
                'model'      => $model,
                'teacher_id' => $teacher->id,
            ]);
            return $this->buildLocalResponse($teacher, $data, true);
        }
    }

    public function availableAgents(Teacher $teacher): array
    {
        $plan    = $teacher->user->aiPlan();
        $allowed = $teacher->user->allowedAiAgents();

        $agents = [];
        foreach (config('ai.agents', []) as $id => $agent) {
            $agents[] = [
                'id'          => $id,
                'label'       => $agent['label'] ?? $id,
                'model'       => $agent['model'] ?? null,
                'description' => $agent['description'] ?? '',
                'unlocked'    => in_array($id, $allowed, true),
            ];
        }

        return [
            'plan'          => $plan,
            'plan_label'    => config("ai.plans.{$plan}.label", 'Gratuit'),
            'default_agent' => config("ai.plans.{$plan}.default_agent", 'flash'),
            'agents'        => $agents,
        ];
    }

    // ────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ────────────────────────────────────────────────────────────

    private function resolveAgent(?User $user, ?string $requestedAgent): array
    {
        $plan    = $user?->aiPlan() ?? config('ai.default_plan', 'free');
        $allowed = $user?->allowedAiAgents() ?? config('ai.plans.free.agents', []);
        $agents  = config('ai.agents', []);

        if ($requestedAgent && isset($agents[$requestedAgent]) && in_array($requestedAgent, $allowed, true)) {
            return [$requestedAgent, $agents[$requestedAgent]['model']];
        }

        $defaultAgent = config("ai.plans.{$plan}.default_agent", array_key_first($agents));
        return [$defaultAgent, $agents[$defaultAgent]['model'] ?? config('ai.gemini.default_model', 'gemini-2.5-flash')];
    }

    private function geminiPayload(Teacher $teacher, array $data): array
    {
        $contents = [];
        $history = $data['history'] ?? [];
        
        // Populate previous history
        foreach ($history as $msg) {
            $contents[] = [
                'role' => $msg['role'] === 'user' ? 'user' : 'model',
                'parts' => $msg['parts'],
            ];
        }

        // Add context to the latest user message if history is empty
        $latestMessage = $data['message'] ?? '';
        if (empty($history)) {
            $latestMessage = $this->enrichInitialMessage($teacher, $data);
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $latestMessage]],
        ];

        return [
            'systemInstruction' => [
                'parts' => [
                    ['text' => $this->systemPrompt()],
                ],
            ],
            'contents' => $contents,
            'generationConfig' => [
                'temperature'     => (float) config('ai.gemini.temperature', 0.65),
                'maxOutputTokens' => (int) config('ai.gemini.max_output_tokens', 3000),
            ],
        ];
    }

    /**
     * Prompt système ancré dans le contexte éducatif camerounais.
     * Référentiels : MINEDUB (primaire) et MINESEC (secondaire).
     */
    private function systemPrompt(): string
    {
        return implode("\n", [
            'Tu es EduAssist IA, un assistant pédagogique expert du système éducatif camerounais.',
            '',
            '=== CONTEXTE NATIONAL ===',
            'Tu opères dans le cadre des programmes officiels du Ministère de l\'Éducation de Base (MINEDUB)',
            'et du Ministère des Enseignements Secondaires (MINESEC) du Cameroun.',
            'Le système scolaire camerounais est bilingue (français/anglais) et comporte :',
            '- Enseignement primaire : SIL, CP, CE1, CE2, CM1, CM2 (MINEDUB)',
            '- Enseignement secondaire général : 6ème, 5ème, 4ème, 3ème | 2nde, 1ère, Tle (MINESEC)',
            '- Enseignement technique et professionnel (CAP, BEP, BAC technique)',
            '',
            '=== APPROCHE PÉDAGOGIQUE ===',
            'Tu respectes la démarche pédagogique officielle camerounaise :',
            '- Approche Par les Compétences (APC) pour le primaire et le secondaire',
            '- Pédagogie active centrée sur l\'apprenant',
            '- Structuration en : Mise en situation → Développement → Activités élèves → Évaluation',
            '- Tiens compte des réalités socio-économiques locales (exemples tirés du quotidien camerounais)',
            '',
            '=== RÈGLES DE GÉNÉRATION ===',
            '1. Utilise exclusivement le français (sauf si explicitement demandé en anglais)',
            '2. Adapte le vocabulaire et les exemples à la classe et à la matière indiquées',
            '3. Les exercices doivent être progressifs : restitution → application → résolution de problème',
            '4. Inclure des références aux réalités camerounaises quand c\'est pertinent (marchés locaux,',
            '   géographie, histoire, personnages historiques camerounais, etc.)',
            '5. Respecter les volumes horaires officiels (45min primaire, 55min secondaire en général)',
            '6. Ne jamais inventer de programmes ou de référentiels inexistants',
            '7. Format de réponse : structuré avec titres clairs, numérotation et tableaux si nécessaire',
        ]);
    }

    /**
     * Enrichit le premier message avec le profil complet de l'enseignant
     * et le contexte éducatif camerounais pour que l'IA le prenne en compte.
     */
    private function enrichInitialMessage(Teacher $teacher, array $data): string
    {
        $niveau = $teacher->classe;
        $matiere = $teacher->matiere;

        // Si l'utilisateur a sélectionné une classe et un cours spécifiques
        if (!empty($data['class_id'])) {
            $class = \App\Models\TeacherClass::find($data['class_id']);
            if ($class && $class->teacher_id === $teacher->id) {
                $niveau = $class->name;
            }
        }

        if (!empty($data['course_id'])) {
            $course = \App\Models\Course::find($data['course_id']);
            // Verify course belongs to the class
            if ($course && (!isset($class) || $course->teacher_class_id === $class->id)) {
                $matiere = $course->name;
            }
        }
        
        // Détection du cycle
        $cycleInfo = $this->detectCycle($niveau);

        $lines = [
            "Voici mon profil et le contexte de ce cours (à prendre en compte pour toutes nos discussions) :",
            "- Nom                  : {$teacher->nom} {$teacher->prenom}",
            "- École                : {$teacher->ecole} (Cameroun)",
            "- Classe actuelle      : {$niveau}",
            "- Matière du cours     : {$matiere}",
        ];

        if ($cycleInfo) {
            $lines[] = "- Cycle scolaire       : {$cycleInfo['cycle']} ({$cycleInfo['sous_cycle']})";
        }

        $lines = array_merge($lines, [
            "",
            "=== MA DEMANDE ACTUELLE ===",
            $data['message'] ?? ''
        ]);

        return implode("\n", $lines);
    }

    /**
     * Instructions de format selon le type de ressource.
     */
    private function formatInstructions(string $type, string $niveau): string
    {
        $isPrimary = $this->isPrimary($niveau);

        return match ($type) {
            'lesson_plan' => implode("\n", [
                "Produis une FICHE DE PRÉPARATION complète avec les sections suivantes :",
                "1. Informations générales (classe, matière, thème, durée, objectifs général + spécifiques)",
                "2. Prérequis des élèves",
                "3. Matériel et ressources nécessaires",
                "4. Déroulement de la leçon :",
                "   - Phase 1 : Mise en situation / Motivation (5-10 min)",
                "   - Phase 2 : Présentation / Explication (15-20 min)",
                "   - Phase 3 : Exercices d'application guidée (10-15 min)",
                "   - Phase 4 : Synthèse / Résumé (5 min)",
                "5. Évaluation formative (2-3 questions)",
                "6. Activité de différenciation (aide aux élèves en difficulté + défi pour les avancés)",
                "7. Devoirs à la maison (optionnel)",
            ]),
            'exercise' => implode("\n", [
                "Génère une SÉRIE D'EXERCICES PROGRESSIFS avec :",
                "- Niveau 1 : Exercices de restitution (connaissances directes) — 3 à 5 questions",
                "- Niveau 2 : Exercices d'application (utilisation du cours) — 3 à 5 questions",
                "- Niveau 3 : Situation problème / Résolution — 1 à 2 exercices contextualisés",
                "- Corrigé complet avec justifications",
                "- Barème indicatif",
            ]),
            'quiz' => implode("\n", [
                "Génère un QUIZ RAPIDE d'évaluation avec :",
                "- 10 questions maximum (QCM, vrai/faux ou questions courtes)",
                "- Durée estimée : 10-15 minutes",
                "- Corrigé avec les bonnes réponses clairement indiquées",
                "- Barème (total sur 10 ou 20 points)",
            ]),
            'summary' => implode("\n", [
                "Rédige un RÉSUMÉ DE LEÇON structuré avec :",
                "- Les points clés en gras",
                "- Les définitions importantes encadrées",
                "- Un tableau de synthèse si pertinent",
                "- 3 à 5 questions de révision à la fin",
                $isPrimary ? "- Adapté pour des élèves de primaire (phrases simples, exemples concrets)" : "- Niveau secondaire, terminologie rigoureuse",
            ]),
            'correction' => implode("\n", [
                "Produis un CORRIGÉ TYPE complet avec :",
                "- Solution détaillée étape par étape",
                "- Justification de chaque réponse",
                "- Erreurs fréquentes à signaler aux élèves",
                "- Barème de notation proposé",
            ]),
            default => "Produis une ressource pédagogique claire et directement utilisable en classe.",
        };
    }

    private function extractOutputText(array $payload): string
    {
        $candidates = $payload['candidates'] ?? [];

        foreach ($candidates as $candidate) {
            $parts = $candidate['content']['parts'] ?? [];
            $text  = '';

            foreach ($parts as $part) {
                if (isset($part['text'])) {
                    $text .= $part['text'];
                }
            }

            if (trim($text) !== '') {
                return trim($text);
            }
        }

        return '';
    }

    /**
     * Réponse locale structurée (fallback si l'API est indisponible).
     * Simule un Chatbot basique.
     */
    private function buildLocalResponse(Teacher $teacher, array $data, bool $remoteFailed = false): array
    {
        $message = $data['message'] ?? '';
        
        $content = implode("\n", [
            "Je suis désolé, mes serveurs IA sont actuellement inaccessibles (Mode Hors-ligne activé).",
            "",
            "Je peux néanmoins voir que vous avez demandé :",
            "> *{$message}*",
            "",
            "**Profil détecté :** {$teacher->prenom} {$teacher->nom} - {$teacher->classe} à {$teacher->ecole}.",
            "",
            "Veuillez vérifier votre connexion internet ou la configuration de votre clé API dans le `.env` pour que je puisse générer du contenu complet et adapté à vos élèves."
        ]);

        return [
            'content'      => $content,
            'provider'     => 'local',
            'agent'        => null,
            'model'        => null,
            'fallback'     => $remoteFailed,
            'generated_at' => now()->toISOString(),
            'plan_cost'    => $this->getPlanPrice($teacher->user),
            'chat_cost'    => 0,
        ];
    }

    private function getPlanPrice(?User $user): float
    {
        $plan = $user?->aiPlan() ?? config('ai.default_plan', 'free');
        return match ($plan) {
            'standard' => 9.99,
            'premium'  => 29.99,
            default    => 0.0,
        };
    }

    private function calculateChatCost(string $agentId, int $charCount): float
    {
        // Estimation basée sur la longueur de la réponse (tokens ≈ chars / 4)
        $tokens = $charCount / 4;
        return match ($agentId) {
            'pro'        => round($tokens * 0.000015, 6),
            'flash'      => round($tokens * 0.000001, 6),
            'flash_lite' => round($tokens * 0.00000015, 6),
            default      => 0.0,
        };
    }

    private function detectCycle(string $niveau): ?array
    {
        $normalized = trim(strtoupper($niveau));
        foreach (self::CYCLES as $key => $info) {
            if (strtoupper($key) === $normalized) {
                return $info;
            }
        }
        return null;
    }

    private function isPrimary(string $niveau): bool
    {
        $info = $this->detectCycle($niveau);
        return $info && $info['cycle'] === 'primaire';
    }

    private function defaultDuration(string $niveau): string
    {
        return $this->isPrimary($niveau) ? '45 minutes' : '55 minutes';
    }
}
