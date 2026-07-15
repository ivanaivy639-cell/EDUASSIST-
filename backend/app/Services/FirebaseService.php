<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    public function verifyIdToken(string $idToken): ?array
    {
        $expectedClientId = env('GOOGLE_WEB_CLIENT_ID');

        if (!$expectedClientId) {
            Log::error('Google token verification failed: GOOGLE_WEB_CLIENT_ID is missing');
            return null;
        }

        try {
            $response = Http::acceptJson()
                ->timeout(15)
                ->get('https://oauth2.googleapis.com/tokeninfo', [
                    'id_token' => $idToken,
                ]);

            if (!$response->successful()) {
                Log::warning('Google token verification failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return null;
            }

            $googleUser = $response->json();

            if (
                empty($googleUser['sub']) ||
                empty($googleUser['email']) ||
                ($googleUser['email_verified'] ?? 'false') !== 'true' ||
                (($googleUser['aud'] ?? '') !== $expectedClientId)
            ) {
                Log::warning('Google token verification returned no usable user', [
                    'aud' => $googleUser['aud'] ?? null,
                    'email_verified' => $googleUser['email_verified'] ?? null,
                ]);

                return null;
            }

            return [
                'uid' => $googleUser['sub'],
                'email' => $googleUser['email'],
                'name' => $googleUser['name'] ?? '',
                'picture' => $googleUser['picture'] ?? null,
            ];
        } catch (\Throwable $e) {
            Log::error('Google token verification failed', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
