<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class AuthService
{
    public function __construct(
        private FirebaseService $firebaseService
    ) {}

    public function authenticateWithGoogle(string $idToken): ?array
    {
        $firebaseUser = $this->firebaseService->verifyIdToken($idToken);

        if (!$firebaseUser) {
            return null;
        }

        return DB::transaction(function () use ($firebaseUser) {
            $user = User::updateOrCreate(
                ['firebase_uid' => $firebaseUser['uid']],
                [
                    'email' => $firebaseUser['email'],
                    'name' => $firebaseUser['name'] ?? '',
                    'avatar_url' => $firebaseUser['picture'] ?? null,
                ]
            );

            $user->tokens()->delete();
            $token = $user->createToken('mobile-auth')->plainTextToken;

            return [
                'user' => $user,
                'token' => $token,
            ];
        });
    }
}
