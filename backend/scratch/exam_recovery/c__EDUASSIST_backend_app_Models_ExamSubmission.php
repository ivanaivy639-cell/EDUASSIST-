<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'student_name',
        'student_matricule',
        'answers',
        'score',
        'max_score',
        'ai_feedback',
        'started_at',
        'submitted_at',
        'ip_address',
        'user_agent',
        'tab_switches',
        'is_auto_submitted',
        'status',
    ];

    protected $casts = [
        'started_at'        => 'datetime',
        'submitted_at'      => 'datetime',
        'score'             => 'decimal:2',
        'max_score'         => 'integer',
        'tab_switches'      => 'integer',
        'is_auto_submitted' => 'boolean',
    ];

    // ──────────────────── Relations ────────────────────

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    // ──────────────────── Helpers ────────────────────

    /**
     * Vérifie si le temps imparti est dépassé.
     */
    public function isExpired(): bool
    {
        if (!$this->started_at || !$this->exam) {
            return false;
        }

        $deadline = $this->started_at->addMinutes($this->exam->duration_minutes);
        return now()->gte($deadline);
    }

    /**
     * Temps restant en secondes.
     */
    public function getRemainingSecondsAttribute(): int
    {
        if (!$this->started_at || !$this->exam) {
            return 0;
        }

        $deadline = $this->started_at->addMinutes($this->exam->duration_minutes);
        $remaining = now()->diffInSeconds($deadline, false);

        return max(0, (int) $remaining);
    }

    /**
     * Vérifie si l'étudiant est disqualifié pour triche.
     */
    public function isDisqualified(): bool
    {
        return $this->status === 'disqualified';
    }

    /**
     * Vérifie si la copie a été soumise.
     */
    public function isSubmitted(): bool
    {
        return in_array($this->status, ['submitted', 'graded', 'disqualified']);
    }
}
