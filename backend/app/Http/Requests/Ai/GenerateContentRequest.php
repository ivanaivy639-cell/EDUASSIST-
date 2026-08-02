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
            'message'         => ['nullable', 'string', 'max:5000'],
            'theme'           => ['nullable', 'string', 'max:500'],
            'niveau'          => ['nullable', 'string', 'max:255'],
            'matiere'         => ['nullable', 'string', 'max:255'],
            'duree'           => ['nullable', 'string', 'max:100'],
            'objectifs'       => ['nullable', 'string', 'max:2000'],
            'consignes'       => ['nullable', 'string', 'max:2000'],
            'history'         => ['nullable', 'array'],
            'history.*.role'  => ['required', 'string', 'in:user,model'],
            'history.*.parts' => ['required', 'array'],
            'history.*.parts.*.text' => ['required', 'string'],
            'agent'           => ['nullable', 'string', Rule::in(array_keys(config('ai.agents', [])))],
            'class_id'        => ['nullable', 'integer', 'exists:teacher_classes,id'],
            'course_id'       => ['nullable', 'integer', 'exists:courses,id'],
            'chapter_id'      => ['nullable', 'integer', 'exists:chapters,id'],
            'lesson_id'       => ['nullable', 'integer', 'exists:lessons,id'],
            'type'            => ['nullable', 'string'],
            'mode'            => ['nullable', 'string'],
            'conversation_id' => ['nullable', 'integer', 'exists:ai_conversations,id'],
            'file_data'       => ['nullable', 'string', 'max:500000'],
            'file_name'       => ['nullable', 'string', 'max:255'],
            'file_type'       => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'file_data.max' => 'Le fichier joint est trop volumineux (max 375 Ko).',
        ];
    }
}
