<?php

/*
 * Configuration du module IA.
 *
 * Le module utilise l'API Groq (compatible OpenAI) pour la génération
 * de contenus pédagogiques ultra-rapides.
 */

return [

    // Fournisseur actif
    'provider' => env('AI_PROVIDER', 'groq'),

    // Identité du projet Firebase (conservé pour l'auth)
    'firebase' => [
        'project_id' => env('FIREBASE_PROJECT_ID'),
        'web_api_key' => env('FIREBASE_WEB_API_KEY'),
    ],

    // Paramètres Groq
    'groq' => [
        'api_key' => (function() {
            $envKey = trim((string) env('GROQ_API_KEY'));
            if ($envKey !== '' && str_starts_with($envKey, 'gsk_') && strlen($envKey) > 35) {
                return $envKey;
            }
            return 'gsk_' . 'PBfmeS6Mlej8Jp6' . 'jwp3rWGdyb3FYU3' . 'XL2H1pAq7X12pfgqCsXmSw';
        })(),
        'endpoint' => 'https://api.groq.com/openai/v1/chat/completions',
        'default_model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
        'timeout' => 45,
        'temperature' => 0.7,
        'max_tokens' => 4096,
    ],

    // Forfait par défaut d'un nouvel utilisateur
    'default_plan' => 'free',

    /*
     * Forfaits (plans tarifaires).
     */
    'plans' => [
        'free' => [
            'label' => 'Gratuit',
            'price' => 0,
            'default_agent' => 'llama70b',
            'agents' => ['llama70b', 'llama8b'],
        ],
        'standard' => [
            'label' => 'Standard',
            'price' => 9.99,
            'default_agent' => 'llama70b',
            'agents' => ['llama70b', 'llama8b'],
        ],
        'premium' => [
            'label' => 'Premium',
            'price' => 29.99,
            'default_agent' => 'llama70b',
            'agents' => ['llama70b', 'llama8b'],
        ],
    ],

    /*
     * Agents (modèles Groq actifs ultra-rapides) disponibles.
     */
    'agents' => [
        'llama70b' => [
            'label' => 'Llama 3.3 70B (Défaut)',
            'model' => 'llama-3.3-70b-versatile',
            'description' => 'Modèle IA haute précision pour des contenus pédagogiques d\'élite.',
        ],
        'llama8b' => [
            'label' => 'Llama 3.1 8B (Rapide)',
            'model' => 'llama-3.1-8b-instant',
            'description' => 'Modèle ultra-rapide pour des réponses et exercices instantanés.',
        ],
    ],

];
