<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationEducation extends Model
{
    use HasFactory;

    protected $table = 'application_educations';

    protected $fillable = [
        'job_application_id',
        'degree',
        'institution',
        'field_of_study',
        'start_date',
        'end_date',
        'grade',
        'honors',
        'highlights',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'honors' => 'boolean',
    ];

    /**
     * Get the job application that owns the education entry.
     */
    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class);
    }
}