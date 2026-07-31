<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiConversation extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'chapter_id',
        'lesson_id',
        'title',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(AiMessage::class, 'conversation_id')->orderBy('created_at');
    }

    /**
     * Auto-generate title from the first user message.
     */
    public function generateTitle(): void
    {
        $firstMessage = $this->messages()->where('role', 'user')->first();
        if ($firstMessage) {
            $this->update([
                'title' => mb_substr(trim($firstMessage->content), 0, 80),
            ]);
        }
    }
}
