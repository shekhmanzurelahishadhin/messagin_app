<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'thread_id'  => $this->thread_id,
            'user_id'    => $this->user_id,
            'user'       => new UserResource($this->whenLoaded('user')),
            'body'       => $this->body,
            'is_read'    => (bool) $this->is_read,
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
