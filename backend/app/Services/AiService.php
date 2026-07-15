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
        'lesson_plan' => 'fiche de preparation',
        'exercise' => 'exercices corriges',
        'quiz' => 'quiz rapide',
        'correction' => 'aide a la correction',
        'summary' => 'resume de cours',
    ];

    public function generate(Teacher $teacher, array $data): array
    {
        $apiKey = config('ai.gemini.api_key');

        if (!$apiKey) {
            return $this->buildLocalResponse($teacher, $data, true);
        }

        [$agentId, $model] = $this->resolveAgent($teacher->user, $data['agent'] ?? null);

        try {
            $endpoint = config('ai.gemini.endpoint').'/models/'.rawurlencode($model).':generateContent';
            $url = $endpoint.'?'.http_build_query(['key' => $apiKey]);

            $response = Http::acceptJson()
                ->timeout((int) config('ai.gemini.timeout', 45))
                ->post($url, $this->geminiPayload($teacher, $data));

            if (!$response->successful()) {
                Log::warning('FIREBASE AI LOGIC generation failed', [
                    'status' => $response->status(),
                    'body' => Str::limit($response->body(), 1000),
                    'agent' => $agentId,
                    'model' => $model,
                    'teacher_id' => $teacher->id,
                    'plan_cost' => $this->getPlanPrice($teacher->user),
                ]);

                return $this->buildLocalResponse($teacher, $data, true);
            }

            $content = trim($this->extractOutputText($response->json()));

            if ($content === '') {
                return $this->buildLocalResponse($teacher, $data, true);
            }

            return [
                'content' => $content,
                'provider' => 'firebase_ai_logic',
                'agent' => $agentId,
                'model' => $model,
                'fallback' => false,
                'generated_at' => now()->toISOString(),
                'plan_cost' => $this->getPlanPrice($teacher->user),
                'chat_cost' => $this->calculateChatCost($agentId, strlen($content)),
            ];
        } catch (\Throwable $e) {
            Log::error('AI generation exception', [
                'error' => $e->getMessage(),
                'agent' => $agentId,
                'model' => $model,
                'teacher_id' => $teacher->id,
                'plan_cost' => $this->getPlanPrice($teacher->user),
            ]);

            return $this->buildLocalResponse($teacher, $data, true);
        }
    }

    public function availableAgents(Teacher $teacher): array
    {
        $plan = $teacher->user->aiPlan();
        $allowed = $teacher->user->allowedAiAgents();

        $agents = [];
        foreach (config('ai.agents', []) as $id => $agent) {
            $agents[] = [
                'id' => $id,
                'label' => $agent['label'] ?? $id,
                'model' => $agent['model'] ?? null,
                'description' => $agent['description'] ?? '',
                'unlocked' => in_array($id, $allowed, true),
            ];
        }

        return [
            'plan' => $plan,
            'plan_label' => config("ai.plans.{$plan}.label", 'Gratuit'),
            'default_agent' => config("ai.plans.{$plan}.default_agent", 'flash'),
            'agents' => $agents,
        ];
    }

    private function resolveAgent(?User $user, ?string $requestedAgent): array
    {
        $plan = $user?->aiPlan() ?? config('ai.default_plan', 'free');
        $allowed = $user?->allowedAiAgents() ?? config('ai.plans.free.agents', []);
        $agents = config('ai.agents', []);

        if ($requestedAgent && isset($agents[$requestedAgent]) && in_array($requestedAgent, $allowed, true)) {
            return [$requestedAgent, $agents[$requestedAgent]['model']];
        }

        $defaultAgent = config("ai.plans.{$plan}.default_agent", array_key_first($agents));

        return [$defaultAgent, $agents[$defaultAgent]['model'] ?? config('ai.gemini.default_model', 'gemini-2.5-flash')];
    }

    private function geminiPayload(Teacher $teacher, array $data): array
    {
        return [
            'systemInstruction' => [
                'parts' => [
                    ['text' => $this->systemPrompt()],
                ],
            ],
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $this->userPrompt($teacher, $data)],
                    ],
                ],
            ],
            'generationConfig' => [
                'temperature' => (float) config('ai.gemini.temperature', 0.7),
                'maxOutputTokens' => (int) config('ai.gemini.max_output_tokens', 2048),
            ],
        ];
    }

    private function getPlanPrice(?User $user): float
    {
        $plan = $user?->aiPlan() ?? config('ai.default_plan', 'free');
        $price = match($plan) {
            'standard' => 9.99,
            'premium' => 29.99,
            default => 0.0,
        };

        return $price;
    }

        private function userPrompt(Teacher $teacher, array $data): string
        {
            $type = self::TYPE_LABELS[$data['type']] ?? 'ressource pedagogique';
            $niveau = $data['niveau'] ?: $teacher->classe;
            $matiere = $data['matiere'] ?: $teacher->matiere;
            $duree = $data['duree'] ?: 'non precisee';
            $objectifs = $data['objectifs'] ?: 'Proposer des objectifs pertinents.';
            $consignes = $data['consignes'] ?: 'Aucune contrainte particuliere.';

            return implode("\n", [
                "Ressource attendue: {$type}",
                "Theme: {$data['theme']}",
                "Niveau: {$niveau}",
                "Matiere: {$matiere}",
                "Duree: {$duree}",
                "Ecole: {$teacher->ecole}",
                "Objectifs: {$objectifs}",
                "Consignes: {$consignes}",
                '',
                'Format attendu:',
                '- Titre',
                '- Objectifs',
                '- Materiel ou pre-requis',
                '- Deroulement ou contenu principal',
                '- Activite eleves',
                '- Evaluation rapide',
                '- Conseils de differenciation',
            ]);
        }

        private function extractOutputText(array $payload): string
        {
            $candidates = $payload['candidates'] ?? [];

            foreach ($candidates as $candidate) {
                $parts = $candidate['content']['parts'] ?? [];
                $text = '';

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

        private function buildLocalResponse(Teacher $teacher, array $data, bool $remoteFailed = false): array
        {
            $type = self::TYPE_LABELS[$data['type']] ?? 'ressource pedagogique';
            $niveau = $data['niveau'] ?: $teacher->classe;
            $matiere = $data['matiere'] ?: $teacher->matiere;
            $duree = $data['duree'] ?: '45 min';
            $objectifs = $data['objectifs'] ?: "Comprendre et reutiliser les notions essentielles du theme {$data['theme']}.";
            $consignes = $data['consignes'] ?: 'Adapter les questions au rythme de la classe.';

            $content = implode("\n", [
                "# {$type}: {$data['theme']}",
                '',
                "Niveau: {$niveau}",
                "Matiere: {$matiere}",
                "Duree: {$duree}",
                '',
                "Objectifs: {$objectifs}",
                '',
                '1. Mise en situation',
                "Presenter le theme {$data['theme']} avec une question simple et concrete.",
                '',
                '2. Construction de la notion',
                'Faire emerger les idees principales avec des exemples progressifs, puis formaliser la regle ou la methode.',
                '',
                '3. Activite eleves',
                'Proposer un travail individuel court, suivi d une mise en commun en binomes.',
                '',
                '4. Evaluation rapide',
                'Donner 3 questions: une question de restitution, une application directe, puis une situation legerement nouvelle.',
                '',
                '5. Differenciation',
                'Prevoir une aide guidee pour les eleves en difficulte et un defi bonus pour les plus rapides.',
                '',
                "Contraintes a respecter: {$consignes}",
            ]);

            return [
                'content' => $content,
                'provider' => $remoteFailed ? 'local' : 'firebase_ai_logic',
                'agent' => null,
                'model' => null,
                'fallback' => $remoteFailed,
                'generated_at' => now()->toISOString(),
                'plan_cost' => $this->getPlanPrice($teacher->user),
                'chat_cost' => $this->calculateChatCost('flash', strlen($content)),
            ];
        }
        $type = self::TYPE_LABELS[$data['type']] ?? 'ressource pedagogique';
        $niveau = $data['niveau'] ?: $teacher->classe;
        $matiere = $data['matiere'] ?: $teacher->matiere;
        $duree = $data['duree'] ?: 'non precisee';
        $objectifs = $data['objectifs'] ?: 'Proposer des objectifs pertinents.';
        $consignes = $data['consignes'] ?: 'Aucune contrainte particuliere.';

    private function systemPrompt(): string
    {
        return implode("\n", [
            'Tu es EduAssist IA, un assistant pedagogique pour enseignants francophones.',
            'Produis une ressource directement exploitable en classe.',
            'Adapte le niveau, la matiere, la duree et les contraintes donnees.',
            'Structure la reponse avec des titres courts, des etapes claires et une partie evaluation si utile.',
            'N invente pas de donnees personnelles et garde un ton professionnel.',
        ]);
    }

    private function extractOutputText(array $payload): string
    {
        $candidates = $payload['candidates'] ?? [];

        foreach ($candidates as $candidate) {
            $parts = $candidate['content']['parts'] ?? [];
            $text = '';

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

    private function buildLocalResponse(Teacher $teacher, array $data, bool $remoteFailed = false): array
    {
        $type = self::TYPE_LABELS[$data['type']] ?? 'ressource pedagogique';
        $niveau = $data['niveau'] ?: $teacher->classe;
        $matiere = $data['matiere'] ?: $teacher->matiere;
        $duree = $data['duree'] ?: '45 min';
        $objectifs = $data['objectifs'] ?: "Comprendre et reutiliser les notions essentielles du theme {$data['theme']}.";
        $consignes = $data['consignes'] ?: 'Adapter les questions au rythme de la classe.';

        $content = implode("\n", [
            "# {$type}: {$data['theme']}",
            '',
            "Niveau: {$niveau}",
            "Matiere: {$matiere}",
            "Duree: {$duree}",
            '',
            "Objectifs: {$objectifs}",
            '',
            '1. Mise en situation',
            "Presenter le theme {$data['theme']} avec une question simple et concrete.",
            '',
            '2. Construction de la notion',
            'Faire emerger les idees principales avec des exemples progressifs, puis formaliser la regle ou la methode.',
            '',
            '3. Activite eleves',
            'Proposer un travail individuel court, suivi d une mise en commun en binomes.',
            '',
            '4. Evaluation rapide',
            'Donner 3 questions: une question de restitution, une application directe, puis une situation legerement nouvelle.',
            '',
            '5. Differenciation',
            'Prevoir une aide guidee pour les eleves en difficulte et un defi bonus pour les plus rapides.',
            '',
            "Contraintes a respecter: {$consignes}",
        ]);

        return [
            'content' => $content,
            'provider' => $remoteFailed ? 'local' : 'firebase_ai_logic',
            'agent' => null,
            'model' => null,
            'fallback' => $remoteFailed,
            'generated_at' => now()->toISOString(),
            'plan_cost' => $this->getPlanPrice($teacher->user),
            'chat_cost' => $this->calculateChatCost('flash', strlen($content)),
        ]
