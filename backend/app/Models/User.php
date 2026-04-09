<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    public function createdThreads()
    {
        return $this->hasMany(Thread::class, 'created_by');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function threadParticipants()
    {
        return $this->hasMany(ThreadParticipant::class);
    }

    public function threads()
    {
        return $this->belongsToMany(Thread::class, 'thread_participants', 'user_id', 'thread_id')
                    ->withPivot('last_read_at')
                    ->withTimestamps();
    }
}
