<?php

namespace App\Http\Controllers;

use App\Http\Requests\ThreadRequest;
use App\Http\Resources\ThreadResource;
use App\Http\Resources\MessageResource;
use App\Models\Thread;
use App\Models\ThreadParticipant;
use App\Models\Message;
use App\Events\MessageSent;
use App\Events\UserThreadsUpdated;
use Illuminate\Http\Request;

class ThreadController extends Controller
{
    /**
     * GET /api/threads
     * Return all threads the authenticated user participates in,
     * sorted by most-recent message, with last-message preview and unread count.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $threads = Thread::whereHas('participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->with([
                'creator',
                'participants.user',
                'messages' => function ($q) {
                    $q->latest()->limit(1);
                },
            ])
            ->withCount([
                'messages as unread_count' => function ($q) use ($user) {
                    $q->where('user_id', '!=', $user->id)
                      ->where('is_read', false);
                },
            ])
            ->orderByDesc(function ($query) {
                $query->select('created_at')
                      ->from('messages')
                      ->whereColumn('thread_id', 'threads.id')
                      ->latest()
                      ->limit(1);
            })
            ->paginate(20);

        return ThreadResource::collection($threads);
    }

    /**
     * POST /api/threads
     */
    public function store(ThreadRequest $request)
    {
        $user = $request->user();

        $thread = Thread::create([
            'subject'    => $request->subject,
            'created_by' => $user->id,
        ]);

        // Add creator as participant
        $participantIds = array_unique(array_merge([$user->id], $request->participants));
        foreach ($participantIds as $participantId) {
            ThreadParticipant::create([
                'thread_id' => $thread->id,
                'user_id'   => $participantId,
            ]);
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

        // Create initial message
        $message = Message::create(array_merge([
            'thread_id' => $thread->id,
            'user_id'   => $user->id,
            'body'      => $request->body ?? '',
            'is_read'   => false,
        ], $attachmentData));

        $thread->touch();
        $message->refresh()->load('user');
        $thread->load(['creator', 'participants.user', 'messages.user']);

        // ── Notify each OTHER participant's personal inbox channel ──
        $lastMessagePayload = [
            'id'         => $message->id,
            'body'       => $message->body ?: ($message->attachment_name ?: 'Attachment'),
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

        // ── Broadcast to the new thread channel ──
        broadcast(new MessageSent($message, $thread));

        return (new ThreadResource($thread))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/threads/{thread}
     */
    public function show(Request $request, Thread $thread)
    {
        $this->authorizeParticipant($request->user(), $thread);

        $messages = $thread->messages()
            ->with('user')
            ->latest()
            ->paginate(20);

        // Mark as read
        $this->markThreadRead($request->user(), $thread);

        return response()->json([
            'thread'   => (new ThreadResource($thread->load(['creator', 'participants.user'])))->resolve(),
            'messages' => MessageResource::collection($messages)->response()->getData(true),
        ]);
    }

    /**
     * PUT /api/threads/{thread}/read
     */
    public function markRead(Request $request, Thread $thread)
    {
        $this->authorizeParticipant($request->user(), $thread);
        $this->markThreadRead($request->user(), $thread);

        return response()->json(['message' => 'Thread marked as read.']);
    }

    /**
     * DELETE /api/threads/{thread}
     */
    public function destroy(Request $request, Thread $thread)
    {
        $this->authorizeParticipant($request->user(), $thread);

        // Remove user from participants (soft-leave)
        ThreadParticipant::where('thread_id', $thread->id)
            ->where('user_id', $request->user()->id)
            ->delete();

        // If no participants remain, delete the thread
        if ($thread->participants()->count() === 0) {
            $thread->messages()->delete();
            $thread->delete();
        }

        return response()->json(['message' => 'Thread removed.']);
    }

    /**
     * GET /api/threads/unread/count
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $count = Message::whereHas('thread.participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->where('user_id', '!=', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    // -------------------------------------------------------------------------

    private function authorizeParticipant($user, Thread $thread): void
    {
        $isParticipant = $thread->participants()
            ->where('user_id', $user->id)
            ->exists();

        if (!$isParticipant) {
            abort(403, 'You are not a participant of this thread.');
        }
    }

    private function markThreadRead($user, Thread $thread): void
    {
        // Mark messages from others as read
        Message::where('thread_id', $thread->id)
            ->where('user_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        // Update last_read_at for participant
        ThreadParticipant::where('thread_id', $thread->id)
            ->where('user_id', $user->id)
            ->update(['last_read_at' => now()]);
    }
}
