<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\UserThreadsUpdated;
use App\Http\Requests\MessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\Thread;
use Illuminate\Http\Request;

use App\Events\MessageDeleted;
use Illuminate\Support\Facades\Storage;

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

        $attachmentData = [];
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('attachments', 'public');
            
            $attachmentData = [
                'attachment_path' => $path,
                'attachment_name' => $file->getClientOriginalName(),
                'attachment_type' => $file->getMimeType(),
            ];
        }

        $message = Message::create(array_merge([
            'thread_id' => $thread->id,
            'user_id'   => $user->id,
            'body'      => $request->body ?? '',
            'is_read'   => false,
        ], $attachmentData));

        $thread->touch();
        $message->refresh()->load('user');

        // ── Broadcast to all clients subscribed to this thread channel ──
        broadcast(new MessageSent($message, $thread));

        // ── Notify each OTHER participant's personal inbox channel ──
        $lastMessagePayload = [
            'id'              => $message->id,
            'body'            => $message->body ?: ($message->attachment_name ?: 'Attachment'),
            'attachment_name' => $message->attachment_name,
            'user_id'         => $message->user_id,
            'created_at'      => $message->created_at
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
     * DELETE /api/messages/{message}
     */
    public function destroy(Request $request, Message $message)
    {
        $user = $request->user();

        // Only sender can delete their message
        if ($message->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $messageId = $message->id;
        $threadId = $message->thread_id;

        // Delete attachment if exists
        if ($message->attachment_path) {
            Storage::disk('public')->delete($message->attachment_path);
        }

        $message->delete();

        // Broadcast deletion
        broadcast(new MessageDeleted($messageId, $threadId));

        return response()->json(['message' => 'Message deleted.']);
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
