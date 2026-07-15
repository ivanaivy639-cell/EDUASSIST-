<?php

/*
 * Configuration du module IA.
 *
 * Le module s'appuie sur "Firebase AI Logic" (anciennement Vertex AI in Firebase)
 * qui utilise les modeles Gemini. Cote backend Laravel, l'appel est effectue
 * via l'API REST Gemini (Gemini Developer API) associee au projet Firebase.
 *
 * Les "agents" correspondent aux modeles Gemini exposes a l'utilisateur.
 * L'acces a chaque agent depend du forfait (plan) paye par l'utilisateur,
 * a la maniere des tranches tarifaires de ChatGPT (gratuit / standard / premium).
 */

return [

    // Fournisseur actif : firebase_ai_logic (Gemini via Firebase)
    'provider' => env('AI_PROVIDER', 'firebase_ai_logic'),

    // Identite du projet Firebase (deja renseignee dans le code)
    'firebase' => [
        'project_id' => env('FIREBASE_PROJECT_ID'),
        'web_api_key' => env('FIREBASE_WEB_API_KEY'),
        'ai_logic_endpoint' => env('FIREBASE_AI_LOGIC_ENDPOINT', 'https://aiplatform.googleapis.com/v1/projects/{projectId}/locations/us-central1/publishers/google/models'),
    ],

    // Parametres Gemini / Firebase AI Logic
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'endpoint' => rtrim(env('GEMINI_ENDPOINT', 'https://generativelanguage.googleapis.com/v1beta'), '/'),
        'default_model' => env('GEMINI_MODEL', 'gemini-2.5-flash'),
        'timeout' => 45,
        'temperature' => 0.7,
        'max_output_tokens' => 2048,
        'firebase_ai_logic_model_mapping' => [
            'flash' => 'gemini-2.5-flash',
            'flash_lite' => 'gemini-2.5-flash-lite',
            'pro' => 'gemini-2.5-pro',
        ],
    ],

    // Forfait par defaut d'un nouvel utilisateur
    'default_plan' => 'free',

    /*
     * Forfaits (frais payes par l'utilisateur).
     * Chaque forfait definit les agents accessibles et l'agent par defaut.
     */
    'plans' => [
        'free' => [
            'label' => 'Gratuit',
            'price' => 0,
            'default_agent' => 'flash',
            'agents' => ['flash'],
        ],
        'standard' => [
            'label' => 'Standard',
            'price' => 9.99,
            'default_agent' => 'flash',
            'agents' => ['flash', 'flash_lite'],
        ],
        'premium' => [
            'label' => 'Premium',
            'price' => 29.99,
            'default_agent' => 'pro',
            'agents' => ['flash', 'flash_lite', 'pro'],
        ],
    ],

    /*
     * Agents (modeles Gemini) disponibles.
     * L'utilisateur peut changer d'agent selon les droits de son forfait.
     */
    'agents' => [
        'flash_lite' => [
            'label' => 'Gemini Flash-Lite',
            'model' => 'gemini-2.5-flash-lite',
            'description' => 'Rapide et economique pour les taches simples du quotidien.',
        ],
        'flash' => [
            'label' => 'Gemini Flash',
            'model' => 'gemini-2.5-flash',
            'description' => 'Equilibre ideal pour preparer des ressources en classe.',
        ],
        'pro' => [
            'label' => 'Gemini Pro',
            'model' => 'gemini-2.5-pro',
            'description' => 'Raisonnement avance pour des ressources pedagogiques complexe.',
        ],
    ],

];
