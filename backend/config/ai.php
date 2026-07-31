<?php

/*
 * Configuration du module IA.
 *
 * Le module utilise l'API Groq (compatible OpenAI) pour la génération
 * de contenus pédagogiques. Groq offre des inférences ultra-rapides
 * sur des modèles open-source (Llama, Qwen, Compound).
 *
 * Les "agents" correspondent aux modèles Groq exposés à l'utilisateur.
 * L'accès à chaque agent dépend du forfait (plan) payé par l'utilisateur.
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
        'api_key' => env('GROQ_API_KEY'),
        'endpoint' => 'https://api.groq.com/openai/v1/chat/completions',
        'default_model' => env('GROQ_MODEL', 'llama-3.1-8b-instant'),
        'timeout' => 60,
        'temperature' => 0.7,
        'max_tokens' => 4096,
    ],

    // Forfait par défaut d'un nouvel utilisateur
    'default_plan' => 'free',

    /*
     * Forfaits (plans tarifaires).
     * Chaque forfait définit les agents accessibles et l'agent par défaut.
     */
    'plans' => [
        'free' => [
            'label' => 'Gratuit',
            'price' => 0,
            'default_agent' => 'llama',
            'agents' => ['llama'],
        ],
        'standard' => [
            'label' => 'Standard',
            'price' => 9.99,
            'default_agent' => 'llama',
            'agents' => ['llama', 'compound'],
        ],
        'premium' => [
            'label' => 'Premium',
            'price' => 29.99,
            'default_agent' => 'compound',
            'agents' => ['llama', 'compound', 'qwen'],
        ],
    ],

    /*
     * Agents (modèles Groq) disponibles.
     */
    'agents' => [
        'llama' => [
            'label' => 'Llama 3.1 8B',
            'model' => 'llama-3.1-8b-instant',
            'description' => 'Rapide et polyvalent pour préparer des ressources pédagogiques.',
        ],
        'compound' => [
            'label' => 'Groq Compound',
            'model' => 'groq/compound',
            'description' => 'Système IA avancé avec recherche web et raisonnement multi-étapes.',
        ],
        'qwen' => [
            'label' => 'Qwen3 32B',
            'model' => 'qwen3-32b',
            'description' => 'Excellent en français, contexte étendu pour les contenus complexes.',
        ],
    ],

];
