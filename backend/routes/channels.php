<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Thread;

// Debug: Log that channels.php is being loaded
Log::info('Channels.php is being loaded');

// Register broadcast routes
Broadcast::routes(['middleware' => ['auth:sanctum']]);

// Register a simple test channel
Broadcast::channel('test', function ($user) {
    Log::info('Test channel callback executed', ['user_id' => $user->id]);
    return true;
});

// Register user channel
Broadcast::channel('user.{id}', function ($user, $id) {
    Log::info('User channel callback executed', [
        'user_id' => $user->id,
        'requested_id' => $id
    ]);
    return (int) $user->id === (int) $id;
});

// Register thread channel (private)
Broadcast::channel('thread.{threadId}', function ($user, $threadId) {
    Log::info('Thread channel callback executed', [
        'user_id' => $user->id,
        'thread_id' => $threadId
    ]);

    // Check if user is a participant in this thread
    $thread = Thread::find($threadId);
    return $thread && $thread->participants()->where('user_id', $user->id)->exists();
});

// Register presence thread channel
Broadcast::channel('presence-thread.{threadId}', function ($user, $threadId) {
    Log::info('Presence thread channel callback executed', [
        'user_id' => $user->id,
        'thread_id' => $threadId
    ]);

    // Check if user is a participant in this thread
    $thread = Thread::find($threadId);
    if ($thread && $thread->participants()->where('user_id', $user->id)->exists()) {
        // Return user info for presence channel
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }

    return false;
});

Log::info('Channels registered successfully');