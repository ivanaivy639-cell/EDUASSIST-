<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
            'prenom' => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
            'telephone' => ['sometimes', 'required', 'string', 'min:8', 'regex:/^[0-9+\s]+$/'],
            'ecole' => ['nullable', 'string', 'max:255'],
            'classe' => ['nullable', 'string', 'max:255'],
            'matiere' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est requis.',
            'prenom.required' => 'Le prénom est requis.',
            'telephone.required' => 'Le téléphone est requis.',
            'telephone.regex' => 'Le téléphone ne doit contenir que des chiffres et le signe plus (+).'
        ];
    }
}
