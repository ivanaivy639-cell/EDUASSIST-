<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TeacherService
{
    public function createProfile(User $user, array $data): Teacher
    {
        if ($user->hasTeacherProfile()) {
            throw new \Exception('Un profil enseignant existe deja.');
        }

        return DB::transaction(function () use ($user, $data) {
            return Teacher::create([
                'user_id' => $user->id,
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'telephone' => $data['telephone'],
                'ecole' => $data['ecole'],
                'classe' => $data['classe'],
                'matiere' => $data['matiere'],
            ]);
        });
    }

    public function getProfile(User $user): ?Teacher
    {
        return $user->teacher;
    }
}
