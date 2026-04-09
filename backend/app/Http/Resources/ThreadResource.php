<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ThreadResource extends JsonResource
{
    public function toArray($request): array
    {
        $lastMessage = $this->messages->first(); // already limited to 1 in query

        return [
            'id'           => $this->id,
            'subject'      => $this->subject,
            'created_by'   => $this->created_by,
            'creator'      => new UserResource($this->whenLoaded('creator')),
            'participants' => UserResource::collection(
                $this->whenLoaded('participants', fn() => $this->participants->pluck('user'))
            ),
            'last_message' => $lastMessage ? [
                'id'         => $lastMessage->id,
                'body'       => $lastMessage->body,
                'user_id'    => $lastMessage->user_id,
                'created_at' => optional($lastMessage->created_at)->toISOString(),
            ] : null,
            'unread_count' => $this->unread_count ?? 0,
            'created_at'   => optional($this->created_at)->toISOString(),
            'updated_at'   => optional($this->updated_at)->toISOString(),
        ];
    }
}
