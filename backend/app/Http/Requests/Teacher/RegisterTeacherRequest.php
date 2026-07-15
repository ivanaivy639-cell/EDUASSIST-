<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class RegisterTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'min:2', 'max:100'],
            'prenom' => ['required', 'string', 'min:2', 'max:100'],
            'telephone' => ['required', 'string', 'min:8', 'regex:/^[0-9+\s]+$/'],
            'ecole' => ['required', 'string', 'min:2', 'max:200'],
            'classe' => ['required', 'string', 'min:1', 'max:100'],
            'matiere' => ['required', 'string', 'min:2', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est requis.',
            'prenom.required' => 'Le prenom est requis.',
            'telephone.required' => 'Le telephone est requis.',
            'telephone.regex' => 'Le telephone ne doit contenir que des chiffres.',
            'ecole.required' => 'L\'ecole est requise.',
            'classe.required' => 'La classe est requise.',
            'matiere.required' => 'La matiere est requise.',
        ];
    }
}
