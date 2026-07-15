<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'email' => $this->user->email,
            'telephone' => $this->telephone,
            'ecole' => $this->ecole,
            'classe' => $this->classe,
            'matiere' => $this->matiere,
        ];
    }
}
