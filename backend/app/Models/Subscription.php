<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subscription_plan_id',
        'plan_type',
        'subscription_end_date',
        'status',
        'notified_before_end',
        'used_posts',
    ];

    protected $casts = [
        'subscription_end_date' => 'datetime',
        'notified_before_end' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
       

    return $this->belongsTo(\App\Models\SubscriptionPlan::class, 'subscription_plan_id');


    }
}
