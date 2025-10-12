<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'employer_id',
        'title',
        'description',
        'location',
        'classification',
        'work_type',
        'workplace',
        'salary',
        'salary_type',
        'company',
        'logo_path',
        'apply_before',
        'video_path',
        'key_points',
        'package_id',
        'is_published',
        'image',
    ];

    protected $casts = [
        'key_points' => 'array',
        'apply_before' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function employer()
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    public function package()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'package_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'job_id')
                    ->where('job_posted', true)
                    ->where('amount', '>', 0);
    }

    public function getRouteKeyName()
    {
        return 'id';
    }
}
