<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
/**
 * @property \Illuminate\Notifications\DatabaseNotificationCollection $notifications
 * @property \Illuminate\Notifications\DatabaseNotificationCollection $unreadNotifications
 */
class Admin extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $fillable = ['name', 'email', 'password'];
    protected $hidden = ['password'];

    /**
     * Automatically hash password when creating/updating
     */
    public function setPasswordAttribute($value)
    {
        // Prevent double-hashing if already hashed
        if (strlen($value) !== 60 || !preg_match('/^\$2y\$/', $value)) {
            $value = Hash::make($value);
        }
        $this->attributes['password'] = $value;
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key-value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}
