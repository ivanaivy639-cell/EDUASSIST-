<?php

namespace App\Http\Requests\Ai;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:lesson_plan,exercise,quiz,correction,summary'],
            'theme' => ['required', 'string', 'min:3', 'max:180'],
            'niveau' => ['nullable', 'string', 'max:100'],
            'matiere' => ['nullable', 'string', 'max:100'],
            'duree' => ['nullable', 'string', 'max:60'],
            'objectifs' => ['nullable', 'string', 'max:800'],
            'consignes' => ['nullable', 'string', 'max:1200'],
            'agent' => ['nullable', 'string', Rule::in(array_keys(config('ai.agents', [])))],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Le type de generation est requis.',
            'type.in' => 'Le type de generation est invalide.',
            'theme.required' => 'Le theme est requis.',
            'theme.min' => 'Le theme doit contenir au moins 3 caracteres.',
        ];
    }
}
