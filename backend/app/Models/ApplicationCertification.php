<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationCertification extends Model
{
    use HasFactory;
    
    protected $table = 'application_certifications';

    protected $fillable = [
        'job_application_id',
        'title',
        'provider',
        'country',
        'year',
        'expiry',
        'credential_id',
        'credential_url',
    ];

    // No date casts needed if year/expiry are strings, but if they become dates, add them.
    // protected $casts = [
    //     'expiry' => 'date', // Example if expiry is a full date
    // ];

    /**
     * Get the job application that owns the certification entry.
     */
    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class);
    }
}