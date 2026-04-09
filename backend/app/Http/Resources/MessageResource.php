<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

use Illuminate\Support\Facades\Storage;

class MessageResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'thread_id'       => $this->thread_id,
            'user_id'         => $this->user_id,
            'user'            => new UserResource($this->whenLoaded('user')),
            'body'            => $this->body,
            'is_read'         => (bool) $this->is_read,
            'attachment_url'  => $this->attachment_path ? Storage::disk('public')->url($this->attachment_path) : null,
            'attachment_name' => $this->attachment_name,
            'attachment_type' => $this->attachment_type,
            'created_at'      => optional($this->created_at)->toISOString(),
        ];
    }
}
