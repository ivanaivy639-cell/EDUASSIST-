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

    /**
     * Génère du contenu pédagogique via l'API Groq.
     */
    public function generate(Teacher $teacher, array $data): array
    {
        $apiKey = config('ai.groq.api_key');

        if (!$apiKey) {
            Log::warning('GROQ_API_KEY manquant, bascule sur mode local');
            return $this->buildLocalResponse($teacher, $data, true);
        }

        [$agentId, $model] = $this->resolveAgent($teacher->user, $data['agent'] ?? null);

        try {
            $endpoint = config('ai.groq.endpoint');

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type'  => 'application/json',
                ])
                ->timeout((int) config('ai.groq.timeout', 60))
                ->post($endpoint, $this->groqPayload($teacher, $data, $model));

            if (!$response->successful()) {
                Log::warning('Groq generation failed', [
                    'status'     => $response->status(),
                    'body'       => Str::limit($response->body(), 1000),
                    'agent'      => $agentId,
                    'model'      => $model,
                    'teacher_id' => $teacher->id,
                ]);

                if ($response->status() === 429 || $response->status() === 413) {
                    return [
                        'content'      => "[ERROR_QUOTA] Vous avez atteint la limite d'utilisation quotidienne (ou la limite de taille) pour ce modèle (" . $agentId . ").\nPour continuer, basculez sur un autre modèle ou réduisez la longueur de votre cours.",
                        'provider'     => 'groq',
                        'agent'        => $agentId,
                        'model'        => $model,
                        'fallback'     => true,
                        'generated_at' => now()->toISOString(),
                        'plan_cost'    => $this->getPlanPrice($teacher->user),
                        'chat_cost'    => 0,
                    ];
                }

                return $this->buildLocalResponse($teacher, $data, true);
            }

            $content = trim($this->extractOutputText($response->json()));

            if ($content === '') {
                Log::warning('Groq returned empty content', ['agent' => $agentId]);
                return $this->buildLocalResponse($teacher, $data, true);
            }

            return [
                'content'      => $content,
                'provider'     => 'groq',
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
            'default_agent' => config("ai.plans.{$plan}.default_agent", 'llama'),
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
        return [$defaultAgent, $agents[$defaultAgent]['model'] ?? config('ai.groq.default_model', 'llama-3.3-70b-versatile')];
    }

    /**
     * Construit le payload au format OpenAI pour l'API Groq.
     */
    private function groqPayload(Teacher $teacher, array $data, string $model): array
    {
        $messages = [];

        // System prompt
        $messages[] = [
            'role'    => 'system',
            'content' => $this->systemPrompt(),
        ];

        // Historique de conversation (Limité aux 4 derniers messages pour économiser les jetons)
        $history = $data['history'] ?? [];
        if (count($history) > 4) {
            $history = array_slice($history, -4);
        }

        foreach ($history as $msg) {
            $role = $msg['role'] === 'user' ? 'user' : 'assistant';
            $text = '';
            foreach ($msg['parts'] as $part) {
                $text .= $part['text'] ?? '';
            }
            $messages[] = [
                'role'    => $role,
                'content' => $text,
            ];
        }

        // Message actuel de l'utilisateur enrichi avec la demande explicite
        $latestMessage = $this->enrichInitialMessage($teacher, $data);

        // Si un fichier est joint, ajouter une description
        if (!empty($data['file_data']) && !empty($data['file_name'])) {
            $fileInfo = "\n\n[Fichier joint : {$data['file_name']}";
            if (!empty($data['file_type'])) {
                $fileInfo .= " ({$data['file_type']})";
            }
            $fileInfo .= "]\nVeuillez analyser ce document et répondre en conséquence.";
            $latestMessage .= $fileInfo;
        }

        // Inject strict formatting rule directly into the final user message so the AI can't ignore it
        $strictReminder = "\n\n[RAPPEL STRICT DU SYSTÈME] : NE DONNE AUCUNE RÉPONSE EN DESSOUS DES QUESTIONS. Tu dois écrire tous les exercices à la suite, de manière vierge. Puis SEULEMENT TOUT À LA FIN du texte, tu dois écrire la balise [SECTION_CORRIGE] et donner les réponses. C'est un impératif technique absolu.";
        
        $messages[] = [
            'role'    => 'user',
            'content' => $latestMessage . $strictReminder,
        ];

        return [
            'model'       => $model,
            'messages'    => $messages,
            'temperature' => (float) config('ai.groq.temperature', 0.7),
            'max_tokens'  => (int) config('ai.groq.max_tokens', 4096),
        ];
    }

    /**
     * Prompt système ancré dans le contexte éducatif camerounais.
     * Référentiels : MINEDUB (primaire) et MINESEC (secondaire).
     */
    private function systemPrompt(): string
    {
        return implode("\n", [
            'Tu es EduAssist IA, un Professeur Agrégé et un Concepteur Pédagogique d\'élite expert du système éducatif camerounais.',
            'Ta mission est de produire des cours d\'une QUALITÉ EXCEPTIONNELLE, dignes des meilleurs ouvrages académiques et universitaires mondiaux.',
            '',
            '=== 1. EXHAUSTIVITÉ ET QUALITÉ PÉDAGOGIQUE (EXIGENCE ABSOLUE) ===',
            '- Ton contenu doit être PROFONDÉMENT DÉTAILLÉ, magistral, et structuré avec une rigueur absolue (minimum 1500 à 2000 mots pour un cours complet).',
            '- NE FAIS JAMAIS DE RÉSUMÉS SIMPLISTES. Développe chaque concept jusqu\'à sa pleine compréhension.',
            '- Agis comme un véritable maître de conférences : explique le "Pourquoi", le "Comment", l\'historique, et les implications pratiques de chaque notion.',
            '- Le ton doit être académique, professionnel, inspirant, clair, et profondément humain.',
            '- Évite le jargon artificiel (ex: "En résumé", "Il est important de noter", "En conclusion"). Sois direct, fluide, et authentique.',
            '',
            '=== 2. ADAPTABILITÉ DU FORMAT ===',
            '- Réponds toujours exactement selon le format demandé par l\'utilisateur (cours complet, quiz court, fiche, exercice, etc).',
            '- Ne force pas la structure d\'un "cours complet" si l\'utilisateur demande seulement un petit exercice ou une réponse rapide.',
            '',
            '=== 3. GÉNÉRATION DE VISUELS HAUTE DÉFINITION (CRITIQUE) ===',
            'Tu dois OBLIGATOIREMENT illustrer tes cours avec des images d\'une qualité visuelle époustouflante pour faciliter l\'apprentissage.',
            '- Insère au moins 2 à 3 images pertinentes et intelligemment placées dans le cours.',
            '- Les images doivent avoir un rendu "Photographie Professionnelle", "Photoréaliste", "Haute Définition (8k)", ou "Schéma Scientifique Très Détaillé".',
            '- Utilise EXACTEMENT ce format Markdown pour générer l\'image via Pollinations AI :',
            '  `![Description courte pour l\'accessibilité](https://image.pollinations.ai/prompt/DESCRIPTION_EN_ANGLAIS_TRES_DETAILLEE_ICI?width=1080&height=720&nologo=true)`',
            '- ASTUCE POUR LE PROMPT IMAGE (en anglais) : Ajoute TOUJOURS des mots-clés de qualité comme : "highly detailed, photorealistic, professional photography, cinematic lighting, educational visualization, 8k resolution, masterpiece".',
            '- Exemple de bonne image : `![Structure de l\'ADN](https://image.pollinations.ai/prompt/macro%20photography%20of%20DNA%20double%20helix%20structure,%20glowing%20blue%20and%20gold%20lights,%20highly%20detailed,%20scientific%20visualization,%208k%20resolution,%20photorealistic?width=1080&height=720&nologo=true)`',
            '- Ne place pas des images juste pour décorer. Elles doivent avoir une VRAIE UTILITÉ PÉDAGOGIQUE (schémas, exemples visuels concrets, illustrations historiques).',
            '',
            '=== 4. CONTEXTE NATIONAL CAMEROUNAIS ===',
            '- Tu opères dans le cadre des programmes officiels du Cameroun (MINEDUB, MINESEC, MINESUP).',
            '- Si la classe ou la matière sont précisées, adapte STRICTEMENT le vocabulaire et la profondeur du cours. Sinon, donne une réponse générale sans poser de questions bloquantes.',
            '- Ancre le cours dans les réalités camerounaises (exemples socio-économiques locaux) tout en gardant un standard international d\'excellence.',
            '',
            '=== 5. VÉRACITÉ ET ESPRIT CRITIQUE ===',
            '- SOIS TOUJOURS VRAI ET VÉRIDIQUE. N\'invente jamais de faits, de lois, ou de référentiels.',
            '- Cite systématiquement tes sources (livres, sites de référence) avec des liens cliquables réels quand c\'est possible.',
            '- Ne sois pas un assistant béni-oui-oui. Si l\'utilisateur propose un raisonnement faux, corrige-le avec pédagogie, tact et objectivité.',
            '- Varie la structure de tes phrases pour créer un vrai rythme de lecture captivant.',
            '',
            '=== STRUCTURE STRICTE DU COURS (À RESPECTER À LA LETTRE SAUF CONTRE-INDICATION) ===',
            '1. TITRE DU COURS',
            '2. OBJECTIFS (Général et Spécifiques)',
            '3. PRÉREQUIS',
            '4. INTRODUCTION (Mise en situation, Problématique)',
            '5. DÉVELOPPEMENT DU COURS (Le cœur de la leçon, avec des sous-parties numérotées, des définitions claires, des exemples locaux, et des schémas/images pollinaitons)',
            '6. CONCLUSION (Résumé des points clés)',
            '7. EXERCICES D\'APPLICATION (Avec leurs corrigés complets)',
            '8. ACTIVITÉS DE RECHERCHE / DEVOIRS',
        ]);
    }

    /**
     * Enrichit le premier message avec le profil complet de l'enseignant
     * et le contexte éducatif camerounais pour que l'IA le prenne en compte.
     */
    private function enrichInitialMessage(Teacher $teacher, array $data): string
    {
        $userMatiere   = !empty($data['matiere']) ? trim($data['matiere']) : null;
        $userNiveau    = !empty($data['niveau']) ? trim($data['niveau']) : null;
        $userTheme     = !empty($data['theme']) ? trim($data['theme']) : (!empty($data['message']) ? trim($data['message']) : null);
        $userDuree     = !empty($data['duree']) ? trim($data['duree']) : null;
        $userObjectifs = !empty($data['objectifs']) ? trim($data['objectifs']) : null;
        $userConsignes = !empty($data['consignes']) ? trim($data['consignes']) : null;
        $ecole         = 'Cameroun';

        $matiere = $userMatiere;
        $niveau  = $userNiveau;

        // 1. Si un cours spécifique est sélectionné (course_id)
        if (!empty($data['course_id'])) {
            $course = \App\Models\Course::with('teacherClass')->find($data['course_id']);
            if ($course) {
                if (!$matiere) {
                    $matiere = $course->name;
                }
                if (!$niveau && $course->teacherClass) {
                    $classObj = $course->teacherClass;
                    $niveau = $classObj->level ? $classObj->level . " (" . $classObj->name . ")" : $classObj->name;
                }
            }
        }

        // 2. Si une classe spécifique est sélectionnée (class_id) : charger STRICTEMENT cette classe
        if (!empty($data['class_id'])) {
            $activeClass = \App\Models\TeacherClass::with('courses')->find($data['class_id']);
            if ($activeClass) {
                if (!$niveau) {
                    $niveau = $activeClass->level ? $activeClass->level . " (" . $activeClass->name . ")" : $activeClass->name;
                }
                if (!$matiere && $activeClass->courses->count() > 0) {
                    $matiere = $activeClass->courses->first()->name;
                }
            }
        }

        // 3. Repli général UNIQUEMENT si aucun class_id ni course_id n'est fourni
        if (empty($data['class_id']) && empty($data['course_id'])) {
            if (!$niveau || !$matiere) {
                $defaultClass = $teacher->classes()->with('courses')->first();
                if ($defaultClass) {
                    if (!$niveau) {
                        $niveau = $defaultClass->level ? $defaultClass->level . " (" . $defaultClass->name . ")" : $defaultClass->name;
                    }
                    if (!$matiere && $defaultClass->courses->count() > 0) {
                        $matiere = $defaultClass->courses->first()->name;
                    }
                }
            }
        }

        $niveau  = $niveau ?: 'Général';
        $matiere = $matiere ?: 'Général';
        $theme   = $userTheme ?: 'Général';

        // 4. Détection du cycle scolaire
        $cycleInfo = $this->detectCycle($niveau);

        $lines = [
            "=================================================================",
            "=== CAHIER DES CHARGES PÉDAGOGIQUE STRICT (À RESPECTER DE MANIÈRE ABSOLUE) ===",
            "=================================================================",
            "- MATIÈRE DU COURS           : {$matiere}",
            "- CLASSE / NIVEAU            : {$niveau}",
            "- THÈME / SUJET PRINCIPAL    : {$theme}",
        ];

        if ($userDuree) {
            $lines[] = "- DURÉE ESTIMÉE              : {$userDuree}";
        }
        if ($userObjectifs) {
            $lines[] = "- OBJECTIFS PÉDAGOGIQUES     : {$userObjectifs}";
        }
        if ($userConsignes) {
            $lines[] = "- CONSIGNES ET CONTRAINTES   : {$userConsignes}";
        }

        $lines[] = "- Enseignant                 : {$teacher->nom} {$teacher->prenom}";
        $lines[] = "- Établissement              : {$ecole}";

        if (!empty($data['chapter_id'])) {
            $chapter = \App\Models\Chapter::find($data['chapter_id']);
            if ($chapter) {
                $lines[] = "- Chapitre actuel      : {$chapter->title}";
            }
        }

        if (!empty($data['lesson_id'])) {
            $lesson = \App\Models\Lesson::find($data['lesson_id']);
            if ($lesson) {
                $lines[] = "- Leçon actuelle       : {$lesson->title}";
            }
        }

        if ($cycleInfo) {
            $lines[] = "- Cycle scolaire       : {$cycleInfo['cycle']} ({$cycleInfo['sous_cycle']})";
        }

        $type = $data['type'] ?? null;
        $mode = $data['mode'] ?? 'dashboard';

        // Si on est dans le générateur de leçon et qu'aucun type n'est spécifié, on génère un cours par défaut
        if (!$type && $mode === 'lesson') {
            $type = 'lesson_plan';
        } elseif (!$type) {
            $type = 'chat';
        }

        $typeInstruction = $this->formatInstructions($type, (string) $niveau);

        $lines = array_merge($lines, [
            "",
            "=== DIRECTIVES DE FORMATAGE SPÉCIFIQUES ===",
            $typeInstruction,
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
                "",
                "*(IMPORTANT : Si l'utilisateur demande explicitement de générer juste un petit exercice ou une autre tâche courte, ignore cette structure lourde et adapte-toi à sa demande)*",
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
                "- 20 questions maximum (QCM, vrai/faux ou questions courtes)",
                "- Durée estimée : 10-20 minutes",
                "- Barème (total sur 10 ou 20 points)",
                "",
                "PARTIE 2 : (Les corrigés)",
                "- Écris IMPÉRATIVEMENT la balise `[SECTION_CORRIGE]` pour séparer.",
                "- Corrigé avec les bonnes réponses clairement indiquées",
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
                "- Barème suggéré",
            ]),
            'chat' => implode("\n", [
                "Adapte-toi à la requête de l'utilisateur sans suivre de structure stricte, tout en restant pédagogique et professionnel."
            ]),
            default => implode("\n", [
                "Adapte-toi à la requête de l'utilisateur sans suivre de structure stricte, tout en restant pédagogique et professionnel."
            ]),
        };
    }

    /**
     * Extrait le texte de la réponse Groq (format OpenAI).
     */
    private function extractOutputText(array $payload): string
    {
        $choices = $payload['choices'] ?? [];

        if (!empty($choices[0]['message']['content'])) {
            return trim($choices[0]['message']['content']);
        }

        return '';
    }

    /**
     * Réponse locale structurée (fallback si l'API est indisponible).
     */
    private function buildLocalResponse(Teacher $teacher, array $data, bool $remoteFailed = false): array
    {
        $content = implode("\n", [
            "HELLO, PATIENTE UN TOUT PETIT PEU.",
            "Veuillez vérifier votre connexion internet `.env`."
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
        $tokens = $charCount / 4;
        return match ($agentId) {
            'qwen'     => round($tokens * 0.000010, 6),
            'compound' => round($tokens * 0.000005, 6),
            'llama'    => round($tokens * 0.000001, 6),
            default    => 0.0,
        };
    }

    private function detectCycle(?string $niveau): ?array
    {
        if (!$niveau) return null;
        $normalized = trim(strtoupper($niveau));
        foreach (self::CYCLES as $key => $info) {
            if (strtoupper($key) === $normalized) {
                return $info;
            }
        }
        return null;
    }

    private function isPrimary(?string $niveau): bool
    {
        if (!$niveau) return false;
        $info = $this->detectCycle($niveau);
        return $info && $info['cycle'] === 'primaire';
    }

    private function defaultDuration(?string $niveau): string
    {
        return $this->isPrimary($niveau) ? '45 minutes' : '55 minutes';
    }
}
