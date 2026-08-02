<?php

/*
 * Configuration du module IA.
 *
 * Le module utilise l'API Groq (compatible OpenAI) pour la génération
 * de contenus pédagogiques. Groq offre des inférences ultra-rapides
 * sur des modèles open-source (Llama, Mixtral, Gemma, Qwen).
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
        'default_model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
        'timeout' => 60,
        'temperature' => 0.7,
        'max_tokens' => 4096,
    ],

    // Forfait par défaut d'un nouvel utilisateur
    'default_plan' => 'free',

    /*
     * Forfaits (plans tarifaires).
     * Tous les modèles sont accessibles pour garantir zéro interruption.
     */
    'plans' => [
        'free' => [
            'label' => 'Gratuit',
            'price' => 0,
            'default_agent' => 'llama70b',
            'agents' => ['llama70b', 'mixtral', 'gemma', 'llama'],
        ],
        'standard' => [
            'label' => 'Standard',
            'price' => 9.99,
            'default_agent' => 'llama70b',
            'agents' => ['llama70b', 'mixtral', 'gemma', 'llama', 'compound'],
        ],
        'premium' => [
            'label' => 'Premium',
            'price' => 29.99,
            'default_agent' => 'llama70b',
            'agents' => ['llama70b', 'mixtral', 'gemma', 'llama', 'compound', 'qwen'],
        ],
    ],

    /*
     * Agents (modèles Groq) disponibles.
     */
    'agents' => [
        'llama70b' => [
            'label' => 'Llama 3.3 70B (Défaut)',
            'model' => 'llama-3.3-70b-versatile',
            'description' => 'Le modèle le plus intelligent et complet pour les cours approfondis.',
        ],
        'mixtral' => [
            'label' => 'Mixtral 8x7B (32k)',
            'model' => 'mixtral-8x7b-32768',
            'description' => 'Excellente capacité de contexte étendu et vitesse d\'exécution.',
        ],
        'gemma' => [
            'label' => 'Gemma 2 9B (Google)',
            'model' => 'gemma2-9b-it',
            'description' => 'Modèle ultra-rapide optimisé par Google.',
        ],
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
            'label' => 'Qwen 2.5 32B',
            'model' => 'qwen-2.5-32b',
            'description' => 'Contexte étendu et excellente maîtrise de la langue française.',
        ],
    ],

];
