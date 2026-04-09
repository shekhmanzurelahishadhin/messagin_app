<?php

namespace App\Events;

use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\Thread;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Message $message,
        public readonly Thread  $thread,
    ) {}

    /**
     * Broadcast on a private channel per thread so only participants receive it.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("thread.{$this->thread->id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        $this->message->refresh()->loadMissing('user');
        $resource = (new MessageResource($this->message))->resolve();

        return [
            'message'   => $resource,
            'thread_id' => $this->thread->id,
        ];
    }
}
