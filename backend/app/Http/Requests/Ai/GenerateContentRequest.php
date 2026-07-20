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
            'message' => ['required', 'string', 'min:1', 'max:2000'],
            'history' => ['nullable', 'array'],
            'history.*.role' => ['required', 'string', 'in:user,model'],
            'history.*.parts' => ['required', 'array'],
            'history.*.parts.*.text' => ['required', 'string'],
            'agent' => ['nullable', 'string', Rule::in(array_keys(config('ai.agents', [])))],
            'class_id' => ['nullable', 'integer', 'exists:teacher_classes,id'],
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'Le message ne peut pas etre vide.',
        ];
    }
}
