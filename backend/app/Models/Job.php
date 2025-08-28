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
        'video_url',
        'key_points',
        'package',
        'is_published'
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

    /**
     * Get the route key for the model.
     * This explicitly tells Laravel to use the 'id' column for Route Model Binding.
     * Even though 'id' is default, sometimes this helps resolve ambiguity.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'id';
    }
}