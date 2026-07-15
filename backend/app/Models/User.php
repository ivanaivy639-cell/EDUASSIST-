<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'firebase_uid',
        'email',
        'name',
        'avatar_url',
        'plan',
        'plan_expires_at',
    ];

    protected $hidden = [
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'plan_expires_at' => 'datetime',
    ];

    public function teacher(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Teacher::class);
    }

    public function hasTeacherProfile(): bool
    {
        return $this->teacher()->exists();
    }

    public function aiPlan(): string
    {
        if ($this->plan === 'premium' && $this->plan_expires_at && $this->plan_expires_at->isPast()) {
            return 'free';
        }

        return $this->plan ?: config('ai.default_plan', 'free');
    }

    public function allowedAiAgents(): array
    {
        return config("ai.plans.{$this->aiPlan()}.agents", config('ai.plans.free.agents', []));
    }
}
