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
            'telephone' => ['required', 'string', 'min:8'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est requis.',
            'prenom.required' => 'Le prenom est requis.',
            'telephone.required' => 'Le telephone est requis.',
            'telephone.regex' => 'Le telephone ne doit contenir que des chiffres.',
        ];
    }
}
