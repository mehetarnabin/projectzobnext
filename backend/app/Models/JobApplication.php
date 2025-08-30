<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_id',
        'status',
        'current_step',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        // 'requested_documents_types' => 'array', // If you added this field
    ];

    /**
     * Get the user that owns the job application.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the job that the application is for.
     */
    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Get the experience entries for the job application.
     */
    public function experiences()
    {
        return $this->hasMany(ApplicationExperience::class, 'job_application_id');
    }

    /**
     * Get the education entries for the job application.
     */
    public function education()
    {
        return $this->hasMany(ApplicationEducation::class, 'job_application_id');
    }

    /**
     * Get the certification entries for the job application.
     */
    public function certifications()
    {
        return $this->hasMany(ApplicationCertification::class, 'job_application_id');
    }

    // You might add helper methods for application steps here later
    public function isStepComplete(string $step): bool
    {
        // Implement logic to check if a step is complete
        // For now, let's keep it simple or remove if not immediately needed
        return true; // Placeholder
    }
}
