<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'course_id',
        'classe',
        'title',
        'content',
        'answer_key',
        'token',
        'duration_minutes',
        'max_score',
        'is_active',
        'exam_date',
        'start_time',
        'end_time',
        'starts_at',
        'ends_at',
        'settings',
    ];

    protected $casts = [
        'is_active'        => 'boolean',
        'exam_date'        => 'date',
        'starts_at'        => 'datetime',
        'ends_at'          => 'datetime',
        'settings'         => 'array',
        'duration_minutes' => 'integer',
        'max_score'        => 'integer',
    ];

    // ──────────────────── Relations ────────────────────

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function submissions()
    {
        return $this->hasMany(ExamSubmission::class);
    }

    // ──────────────────── Helpers ────────────────────

    /**
     * Génère un token unique pour le lien public.
     */
    public static function generateToken(): string
    {
        do {
            $token = Str::random(16);
        } while (self::where('token', $token)->exists());

        return $token;
    }

    /**
     * Vérifie si l'examen est accessible (actif et dans la fenêtre de temps).
     */
    public function isAccessible(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }

        if ($this->ends_at && $now->gt($this->ends_at)) {
            return false;
        }

        return true;
    }

    /**
     * URL publique de l'examen.
     */
    public function getPublicUrlAttribute(): string
    {
        return url("/exam/{$this->token}");
    }

    /**
     * Nombre de soumissions corrigées.
     */
    public function getGradedCountAttribute(): int
    {
        return $this->submissions()->where('status', 'graded')->count();
    }

    /**
     * Nombre total de soumissions.
     */
    public function getTotalSubmissionsAttribute(): int
    {
        return $this->submissions()->count();
    }

    /**
     * Moyenne des notes.
     */
    public function getAverageScoreAttribute(): ?float
    {
        $avg = $this->submissions()->where('status', 'graded')->avg('score');
        return $avg !== null ? round($avg, 2) : null;
    }
}
