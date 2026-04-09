<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;

class BroadcastServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Make sure the auth middleware is properly applied
        Broadcast::routes(['middleware' => ['auth:sanctum']]);

        // Alternative: Use web middleware if using session auth
        // Broadcast::routes(['middleware' => ['web', 'auth:sanctum']]);

        require base_path('routes/channels.php');
    }
}