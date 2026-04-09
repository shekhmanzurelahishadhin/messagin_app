<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\UserThreadsUpdated;
use App\Http\Requests\MessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\Thread;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * POST /api/threads/{thread}/messages
     */
    public function store(MessageRequest $request, Thread $thread)
    {
        $user = $request->user();

        // Ensure user is a participant
        $isParticipant = $thread->participants()
            ->where('user_id', $user->id)
            ->exists();

        if (!$isParticipant) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $message = Message::create([
            'thread_id' => $thread->id,
            'user_id'   => $user->id,
            'body'      => $request->body,
            'is_read'   => false,
        ]);

        $thread->touch();
        $message->refresh()->load('user');

        // ── Broadcast to all clients subscribed to this thread channel ──
        broadcast(new MessageSent($message, $thread));

        // ── Notify each OTHER participant's personal inbox channel ──
        $lastMessagePayload = [
            'id'         => $message->id,
            'body'       => $message->body,
            'user_id'    => $message->user_id,
            'created_at' => $message->created_at
                ? $message->created_at->toISOString()
                : null,
        ];

        $thread->participants()
            ->where('user_id', '!=', $user->id)
            ->pluck('user_id')
            ->each(function (int $participantUserId) use ($thread, $lastMessagePayload) {
                broadcast(new UserThreadsUpdated($participantUserId, $thread, $lastMessagePayload));
            });

        return (new MessageResource($message))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * PUT /api/messages/{message}/read
     */
    public function markRead(Request $request, Message $message)
    {
        $user = $request->user();

        $isParticipant = $message->thread->participants()
            ->where('user_id', $user->id)
            ->exists();

        if (!$isParticipant) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $message->update(['is_read' => true]);

        return response()->json(['message' => 'Message marked as read.']);
    }
}
