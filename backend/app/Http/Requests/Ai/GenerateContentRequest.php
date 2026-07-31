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
            'chapter_id' => ['nullable', 'integer', 'exists:chapters,id'],
            'lesson_id' => ['nullable', 'integer', 'exists:lessons,id'],
            'type' => ['nullable', 'string'],
            'mode' => ['nullable', 'string'],
            // Conversation pour persistance
            'conversation_id' => ['nullable', 'integer', 'exists:ai_conversations,id'],
            // Fichier joint (base64)
            'file_data' => ['nullable', 'string', 'max:500000'],
            'file_name' => ['nullable', 'string', 'max:255'],
            'file_type' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'Le message ne peut pas etre vide.',
            'file_data.max' => 'Le fichier joint est trop volumineux (max 375 Ko).',
        ];
    }
}
