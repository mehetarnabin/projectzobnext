<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'company_id', // CHANGED: Now uses company_id
        'role',
        'designation',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Required methods for JWTSubject
    public function getJWTIdentifier()
    {
        return $this->getKey(); // Usually the user's ID
    }

    public function getJWTCustomClaims()
    {
        return []; // Add any custom claims you want in the token
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    /**
     * Get the jobs posted by the employer.
     */
    public function jobs()
    {
        return $this->hasMany(Job::class, 'employer_id');
    }

    /**
     * Get the job applications made by the job seeker.
     */
    public function jobApplications()
    {
        return $this->hasMany(JobApplication::class);
    }

    /**
     * Get the company that the user belongs to.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Check if the user has the 'employer' role.
     *
     * @return bool
     */
    public function isEmployer()
    {
        return $this->role === 'employer';
    }

    /**
     * Check if the user has the 'jobseeker' role.
     *
     * @return bool
     */
    public function isJobseeker()
    {
        return $this->role === 'jobseeker';
    }

    /**
     * Check if the user has the 'staffing' role.
     *
     * @return bool
     */
    public function isStaffing()
    {
        return $this->role === 'staffing';
    }
}
