<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'address',
        'website',
        'logo_url',
        'banner_url',
        'badges',
    ];

    protected $casts = [
        'badges' => 'array',
    ];

    /**
     * Get the users that belong to the company.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the jobs posted by the company.
     */
    public function jobs()
    {
        return $this->hasMany(Job::class);
    }
}
