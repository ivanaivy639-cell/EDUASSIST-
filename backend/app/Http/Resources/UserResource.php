<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'firebase_uid' => $this->firebase_uid,
            'email' => $this->email,
            'name' => $this->name,
            'avatar_url' => $this->avatar_url,
            'plan' => $this->aiPlan(),
        ];
    }
}
