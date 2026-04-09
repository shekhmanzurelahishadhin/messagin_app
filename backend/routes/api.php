<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ThreadController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Broadcasting channel authentication (used by Laravel Echo / Reverb)
    Broadcast::routes(['middleware' => ['auth:sanctum']]);

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Users (for participant selection)
    Route::get('/users', [UserController::class, 'index']);

    // Threads
    Route::get('/threads/unread/count', [ThreadController::class, 'unreadCount']);
    Route::apiResource('threads', ThreadController::class)->except(['update']);
    Route::put('/threads/{thread}/read', [ThreadController::class, 'markRead']);

    // Messages
    Route::post('/threads/{thread}/messages', [MessageController::class, 'store']);
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
    Route::put('/messages/{message}/read', [MessageController::class, 'markRead']);
});
