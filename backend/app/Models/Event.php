<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'title',
        'description',
        'start_time',
        'end_time',
        'location',
        'organizer',
        'category',
        'image_url',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
    ];
}
