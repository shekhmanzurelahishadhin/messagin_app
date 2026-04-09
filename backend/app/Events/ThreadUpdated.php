<?php

namespace App\Events;

use App\Http\Resources\ThreadResource;
use App\Models\Thread;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ThreadUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Thread $thread,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("thread.{$this->thread->id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'thread.updated';
    }

    public function broadcastWith(): array
    {
        $this->thread->loadMissing(['creator', 'participants.user', 'messages']);

        return [
            'thread' => (new ThreadResource($this->thread->refresh()))->resolve(),
        ];
    }
}
