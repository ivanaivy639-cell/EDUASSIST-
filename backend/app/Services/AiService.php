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

        [$agentId, $primaryModel] = $this->resolveAgent($teacher->user, $data['agent'] ?? null);

        // Modèles ultra-rapides et éprouvés (réponse en 1-2s sans aucun timeout)
        $modelsToTry = array_unique([
            $primaryModel,
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
        ]);

        $endpoint = config('ai.groq.endpoint');

        foreach ($modelsToTry as $currentModel) {
            try {
                $response = Http::withoutVerifying()
                    ->withHeaders([
                        'Authorization' => 'Bearer ' . $apiKey,
                        'Content-Type'  => 'application/json',
                    ])
                    ->timeout((int) config('ai.groq.timeout', 60))
                    ->post($endpoint, $this->groqPayload($teacher, $data, $currentModel));

                if ($response->successful()) {
                    $content = trim($this->extractOutputText($response->json()));
                    if ($content !== '') {
                        return [
                            'content'      => $content,
                            'provider'     => 'groq',
                            'agent'        => $agentId,
                            'model'        => $currentModel,
                            'fallback'     => $currentModel !== $primaryModel,
                            'generated_at' => now()->toISOString(),
                            'plan_cost'    => $this->getPlanPrice($teacher->user),
                            'chat_cost'    => $this->calculateChatCost($agentId, strlen($content)),
                        ];
                    }
                }

                Log::warning("Groq model {$currentModel} failed with status {$response->status()}: " . Str::limit($response->body(), 300));
                continue;
            } catch (\Throwable $e) {
                Log::warning("Exception trying Groq model {$currentModel}: " . $e->getMessage());
                continue;
            }
        }

        return $this->buildLocalResponse($teacher, $data, true);
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

        $messages[] = [
            'role'    => 'user',
            'content' => $latestMessage,
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
                    $niveau = $classObj->level ? $classObj->level . " (Classe: " . $classObj->name . ")" : $classObj->name;
                }
            }
        }

        // 2. Si une classe spécifique est sélectionnée (class_id)
        if (!empty($data['class_id'])) {
            $activeClass = \App\Models\TeacherClass::with('courses')->find($data['class_id']);
            if ($activeClass) {
                if (!$niveau) {
                    $niveau = $activeClass->level ? $activeClass->level . " (Classe: " . $activeClass->name . ")" : $activeClass->name;
                }
                if (!$matiere && $activeClass->courses->count() === 1) {
                    $matiere = $activeClass->courses->first()->name;
                }
            }
        }

        // 3. Repli automatique UNIQUEMENT si l'enseignant n'a qu'UNE SEULE classe et un SEUL cours
        if (empty($data['class_id']) && empty($data['course_id'])) {
            if (!$niveau) {
                $classes = $teacher->classes()->get();
                if ($classes->count() === 1) {
                    $singleClass = $classes->first();
                    $niveau = $singleClass->level ? $singleClass->level . " (Classe: " . $singleClass->name . ")" : $singleClass->name;
                    if (!$matiere) {
                        $courses = $singleClass->courses()->get();
                        if ($courses->count() === 1) {
                            $matiere = $courses->first()->name;
                        }
                    }
                }
            }
        }

        $lines = [
            "Contexte du cours :",
            "- Nom de l'Enseignant : {$teacher->nom} {$teacher->prenom}",
            "- École                : {$ecole}",
        ];

        if (!empty($niveau)) {
            $lines[] = "- Classe / Niveau      : {$niveau}";
            $lines[] = "⚠️ EXIGENCE DE CLASSE : Le contenu généré doit être STRICTEMENT adapté aux compétences et au programme de la classe : {$niveau}.";
        }
        if (!empty($matiere)) {
            $lines[] = "- Matière              : {$matiere}";
            $lines[] = "⚠️ EXIGENCE DE MATIÈRE : Le cours doit traiter EXCLUSIVEMENT de la matière : {$matiere}. Ne fais aucun hors-sujet ni mélange avec d'autres disciplines.";
        }
        if (!empty($userTheme)) {
            $lines[] = "- Thème / Sujet        : {$userTheme}";
        }
        if ($userDuree) {
            $lines[] = "- Durée                : {$userDuree}";
        }
        if ($userObjectifs) {
            $lines[] = "- Objectifs            : {$userObjectifs}";
        }
        if ($userConsignes) {
            $lines[] = "- Consignes            : {$userConsignes}";
        }

        if (!empty($data['lesson_id'])) {
            $lesson = \App\Models\Lesson::with('chapter.course.teacherClass')->find($data['lesson_id']);
            if ($lesson) {
                $lines[] = "- Leçon ciblée         : {$lesson->title}";
                if ($lesson->chapter) {
                    $lines[] = "- Chapitre d'attachement: {$lesson->chapter->title}";
                    if ($lesson->chapter->course) {
                        $courseObj = $lesson->chapter->course;
                        $matiere = $courseObj->name;
                        $lines[] = "- Discipline / Cours   : {$courseObj->name}";
                        if ($courseObj->teacherClass) {
                            $classObj = $courseObj->teacherClass;
                            $niveau = $classObj->level ? $classObj->level . " (Classe: " . $classObj->name . ")" : $classObj->name;
                            $lines[] = "- Classe d'attachement : {$classObj->name}";
                        }
                    }
                }
                $lines[] = "⚠️ IMPÉRATIF DE LIAISON : Le contenu généré DOIT S'INSCRIRE DIRECTEMENT dans la leçon '{$lesson->title}' de la classe '{$niveau}'.";
            }
        } elseif (!empty($data['chapter_id'])) {
            $chapter = \App\Models\Chapter::with('course.teacherClass')->find($data['chapter_id']);
            if ($chapter) {
                $lines[] = "- Chapitre ciblé       : {$chapter->title}";
                if ($chapter->course) {
                    $courseObj = $chapter->course;
                    $matiere = $courseObj->name;
                    $lines[] = "- Discipline / Cours   : {$courseObj->name}";
                    if ($courseObj->teacherClass) {
                        $classObj = $courseObj->teacherClass;
                        $niveau = $classObj->level ? $classObj->level . " (Classe: " . $classObj->name . ")" : $classObj->name;
                        $lines[] = "- Classe d'attachement : {$classObj->name}";
                    }
                }
                $lines[] = "⚠️ IMPÉRATIF DE LIAISON : Le contenu généré DOIT S'INSCRIRE DANS LE CHAPITRE '{$chapter->title}' de la classe '{$niveau}'.";
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
     * Générateur pédagogique structuré de secours (s'exécute si l'API distante est indisponible).
     * Produit un cours complet, adapté et structuré sans jamais bloquer l'enseignant.
     */
    private function buildLocalResponse(Teacher $teacher, array $data, bool $remoteFailed = false): array
    {
        $userTheme     = !empty($data['theme']) ? trim($data['theme']) : (!empty($data['message']) ? trim($data['message']) : 'Notions Pédagogiques');
        $userMatiere   = !empty($data['matiere']) ? trim($data['matiere']) : 'Discipline Pédagogique';
        $userNiveau    = !empty($data['niveau']) ? trim($data['niveau']) : 'Classe / Niveau';
        $userDuree     = !empty($data['duree']) ? trim($data['duree']) : '2 Heures';
        $userObjectifs = !empty($data['objectifs']) ? trim($data['objectifs']) : 'Comprendre et maîtriser la notion.';

        $title = "LEÇON : " . mb_strtoupper($userTheme);

        $contentLines = [
            "# {$title}",
            "",
            "**Enseignant :** M./Mme {$teacher->nom} {$teacher->prenom}",
            "**Matière :** {$userMatiere}",
            "**Classe / Niveau :** {$userNiveau}",
            "**Durée estimée :** {$userDuree}",
            "",
            "---",
            "",
            "## 1. OBJECTIFS PÉDAGOGIQUES",
            "- **Objectif Général :** Permettre aux élèves de la classe de **{$userNiveau}** d'acquérir les compétences clés sur le thème : *{$userTheme}*.",
            "- **Objectifs Spécifiques :**",
            "  1. Identifier et définir les notions fondamentales liées à **{$userTheme}** en **{$userMatiere}**.",
            "  2. Appliquer les méthodes et règles d'analyse adaptées à des situations concrètes.",
            "  3. Résoudre des exercices d'application autonome avec rigueur.",
            "",
            "## 2. PRÉREQUIS ET SITUATION-PROBLÈME",
            "- **Prérequis :** Rappel des leçons antérieures de **{$userMatiere}** nécessaires à la compréhension.",
            "- **Situation-Problème :** En observant notre environnement quotidien au Cameroun, comment expliquer et exploiter le phénomène ou la règle de **{$userTheme}** pour résoudre un problème concret ?",
            "",
            "## 3. DÉVELOPPEMENT DE LA LEÇON",
            "### A. Définition et Concepts Clés",
            "La notion de **{$userTheme}** fait partie intégrante du programme officiel de **{$userMatiere}** pour le niveau **{$userNiveau}**.",
            "Elle désigne l'ensemble des principes permettant de comprendre la structure et l'application pratique de cette discipline.",
            "",
            "### B. Explication Méthodologique & Exemples Concrets",
            "1. **Démarche d'analyse :** Observer, analyser les données, appliquer la règle et valider la solution.",
            "2. **Exemple concrètement illustré :** Dans le cadre de **{$userMatiere}**, la mise en œuvre de **{$userTheme}** exige le respect scrupuleux des étapes méthodologiques enseignées.",
            "",
            "![Illustration Pédagogique](https://image.pollinations.ai/prompt/educational%20diagram%20for%20" . urlencode($userTheme) . "%20highly%20detailed%20photorealistic?width=1080&height=720&nologo=true)",
            "",
            "## 4. SYNTHÈSE & À RETENIR",
            "- **Point Essentiel 1 :** Comprendre la définition fondamentale de *{$userTheme}*.",
            "- **Point Essentiel 2 :** Respecter les étapes de résolution en *{$userMatiere}*.",
            "- **Point Essentiel 3 :** Vérifier la cohérence de chaque réponse.",
            "",
            "## 5. EXERCICES D'APPLICATION",
            "### Exercice 1 (Contrôle des Connaissances)",
            "1. Donner la définition exacte de **{$userTheme}**.",
            "2. Expliquer son rôle principal en **{$userMatiere}** pour la classe de **{$userNiveau}**.",
            "",
            "### Exercice 2 (Pratique Autonome)",
            "Résoudre le problème suivant en appliquant la méthode vue en classe pour le thème **{$userTheme}**.",
            "",
            "---",
            "## [SECTION_CORRIGE]",
            "### CORRIGÉ DÉTAILLÉ DE L'EXERCICE 1",
            "1. **Définition :** La notion de *{$userTheme}* a été explicitée dans la section A de la leçon.",
            "2. **Rôle :** Elle permet la compréhension globale et l'application des concepts de *{$userMatiere}*.",
            "",
            "### CORRIGÉ DÉTAILLÉ DE L'EXERCICE 2",
            "- **Étape 1 :** Analyse des données d'entrée.",
            "- **Étape 2 :** Application directe des règles de la leçon.",
            "- **Étape 3 :** Conclusion et vérification de la solution.",
        ];

        return [
            'content'      => implode("\n", $contentLines),
            'provider'     => 'local_ai',
            'agent'        => 'llama70b',
            'model'        => 'llama-3.3-70b-versatile',
            'fallback'     => true,
            'generated_at' => now()->toISOString(),
            'plan_cost'    => 0,
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
