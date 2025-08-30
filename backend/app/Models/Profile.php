<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'designation',
        'company',
        'logo_url',
        'banner_url',
        'github',
        'linkedin',
        'facebook',
        'instagram',
        'twitter',
        'badges',
        'email',
        'phone',
        'country',
        'address',
        'show_email',
        'show_phone',
        'show_address',
        'about',
        'education',
        'work_experience',
        'memberships',
        'certifications',
        'licenses',
        'logo_path',
        'banner_path',
    ];

    protected $casts = [
        'badges' => 'array', // Cast badges to array for easy handling
        'show_email' => 'boolean',
        'show_phone' => 'boolean',
        'show_address' => 'boolean',
        'education' => 'array',
        'work_experience' => 'array',
        'memberships' => 'array',
        'certifications' => 'array',
        'licenses' => 'array',
    ];

    /**
     * Get the user that owns the profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}