<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class GoogleLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_token' => ['required', 'string', 'min:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'id_token.required' => 'Le token Firebase est requis.',
            'id_token.string' => 'Le token doit etre une chaine de caracteres.',
            'id_token.min' => 'Le token semble invalide.',
        ];
    }
}
