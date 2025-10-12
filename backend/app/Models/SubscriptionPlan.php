<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'plan_type',
        'name',
        'price',
        'description',
        'features',
        'recommended',
        'max_posts'
    ];

    protected $casts = [
        'features' => 'array', // auto-convert JSON to array
        'recommended' => 'boolean',
    ];
}
