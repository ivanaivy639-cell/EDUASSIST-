<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\GoogleLoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;

class GoogleAuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    public function login(GoogleLoginRequest $request): JsonResponse
    {
        $result = $this->authService->authenticateWithGoogle($request->validated('id_token'));

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Token Google invalide ou expire.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Connexion reussie.',
            'data' => [
                'user' => new UserResource($result['user']),
                'access_token' => $result['token'],
                'token_type' => 'Bearer',
            ],
        ]);
    }
}
