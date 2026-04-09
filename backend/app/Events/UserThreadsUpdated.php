<?php

namespace App\Events;

use App\Http\Resources\ThreadResource;
use App\Models\Thread;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Sent to every participant's private user channel when a thread they belong to
 * receives a new message, so their inbox list updates in real time.
 */
class UserThreadsUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int    $userId,
        public readonly Thread $thread,
        public readonly array  $lastMessage,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("user.{$this->userId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'threads.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'thread_id'    => $this->thread->id,
            'subject'      => $this->thread->subject,
            'last_message' => [
                'id'         => $this->lastMessage['id'],
                'body'       => $this->lastMessage['body'],
                'user_id'    => $this->lastMessage['user_id'],
                'created_at' => $this->lastMessage['created_at'] ?? now()->toISOString(),
            ],
        ];
    }
}
