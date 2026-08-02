<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    /**
     * Vérifie le jeton d'identité Google/Firebase auprès des serveurs Google OAuth2.
     */
    public function verifyIdToken(string $idToken): ?array
    {
        $expectedClientId = env('GOOGLE_WEB_CLIENT_ID');

        try {
            $response = Http::withoutVerifying()
                ->acceptJson()
                ->timeout(15)
                ->get('https://oauth2.googleapis.com/tokeninfo', [
                    'id_token' => $idToken,
                ]);

            if (!$response->successful()) {
                Log::warning('Google tokeninfo verification failed', [
                    'status' => $response->status(),
                    'body'   => $response->json(),
                ]);

                return null;
            }

            $googleUser = $response->json();

            // Vérification des champs indispensables Google
            if (empty($googleUser['sub']) || empty($googleUser['email'])) {
                Log::warning('Google tokeninfo missing sub or email', [
                    'user' => $googleUser,
                ]);
                return null;
            }

            // Vérification email_verified (supporte boolean true, string "true", ou entier 1)
            $rawVerified = $googleUser['email_verified'] ?? true;
            $isEmailVerified = filter_var($rawVerified, FILTER_VALIDATE_BOOLEAN);

            if (!$isEmailVerified) {
                Log::warning('Google email not verified', [
                    'email' => $googleUser['email'] ?? null,
                ]);
                return null;
            }

            // Journaliser la validation réussie
            Log::info('Google ID token verified successfully', [
                'sub'   => $googleUser['sub'],
                'email' => $googleUser['email'],
                'aud'   => $googleUser['aud'] ?? null,
            ]);

            return [
                'uid'     => $googleUser['sub'],
                'email'   => $googleUser['email'],
                'name'    => $googleUser['name'] ?? explode('@', $googleUser['email'])[0],
                'picture' => $googleUser['picture'] ?? null,
            ];
        } catch (\Throwable $e) {
            Log::error('Google token verification exception', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
