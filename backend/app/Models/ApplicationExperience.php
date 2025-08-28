<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationExperience extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_application_id',
        'job_title',
        'company',
        'start_date',
        'end_date',
        'description',
        'current_job',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'current_job' => 'boolean',
    ];

    /**
     * Get the job application that owns the experience.
     */
    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class);
    }
}
