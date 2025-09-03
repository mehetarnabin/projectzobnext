<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\EventController;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\Company;
use App\Models\User;

// Public Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Company search for autocomplete
Route::get('/companies/search', function (Request $request) {
    $query = $request->input('query');
    if (!$query) return response()->json([]);
    $companies = Company::where('name', 'like', '%' . $query . '%')
                        ->select('id', 'name')
                        ->limit(10)
                        ->get();
    return response()->json($companies);
});

// Test DB connection
Route::get('/test-db-connection', function () {
    try {
        DB::connection()->getPdo();
        $dbName = DB::connection()->getDatabaseName();
        $jobIdToTest = 4;
        $job = Job::find($jobIdToTest);

        if ($job) {
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully connected to database and found job.',
                'database' => $dbName,
                'job_found' => true,
                'job_id' => $job->id,
                'job_title' => $job->title,
                'job_is_published' => $job->is_published
            ]);
        } else {
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully connected to database but job ' . $jobIdToTest . ' NOT found.',
                'database' => $dbName,
                'job_found' => false
            ]);
        }
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Could not connect to the database or an error occurred: ' . $e->getMessage(),
            'error_details' => [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]
        ], 500);
    }
});

// Public routes
Route::get('/users', [UserController::class, 'index']);
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{jobId}', function ($jobId) {
    $job = Job::find($jobId);
    if (!$job) return response()->json(['error' => 'Job not found.'], 404);
    return (new JobController())->show($job, request());
})->name('jobs.show');

// Public events
Route::get('/events', [EventController::class, 'index']);

// Protected routes
Route::middleware('auth:api')->group(function () {

    // Auth
    Route::get('/user', [AuthController::class, 'getAuthenticatedUser']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Profile
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::post('/header', [ProfileController::class, 'updateHeader']);
        Route::post('/basic-info', [ProfileController::class, 'updateBasicInfo']);
        Route::post('/about-me', [ProfileController::class, 'updateAboutMe']);
        Route::post('/education', [ProfileController::class, 'updateEducation']);
        Route::post('/work-experience', [ProfileController::class, 'updateWorkExperience']);
        Route::post('/memberships', [ProfileController::class, 'updateMemberships']);
        Route::post('/certifications', [ProfileController::class, 'updateCertifications']);
        Route::post('/licenses', [ProfileController::class, 'updateLicenses']);
    });

    // Employer Profile
    Route::prefix('employer-profile')->group(function () {
        Route::get('/', [ProfileController::class, 'showEmployerProfile']);
        Route::post('/company-header', [ProfileController::class, 'updateCompanyHeader']);
        Route::post('/user-profile', [ProfileController::class, 'updateEmployerUserProfile']);
        Route::get('/managers', function () {
            $user = Auth::user();
            if (!$user || !$user->company_id) return response()->json(['message' => 'Unauthorized'], 401);

            $managers = User::where('company_id', $user->company_id)
                            ->where('designation', 'Manager')
                            ->select('id', 'name', 'designation', 'email', 'phone_number')
                            ->get()
                            ->map(function ($manager) {
                                $profile = $manager->profile()->first();
                                $manager->logo_url = $profile ? (str_starts_with($profile->logo_url, 'images/default_') ? asset($profile->logo_url) : asset('storage/' . $profile->logo_url)) : asset('images/default_profile.jpg');
                                return $manager;
                            });
            return response()->json($managers);
        });
    });

    // Jobs
    Route::post('/jobs', [JobController::class, 'store']);
    Route::put('/jobs/{job}', [JobController::class, 'update']);
    Route::delete('/jobs/{job}', [JobController::class, 'destroy']);

    // Job Applications (Jobseeker)
    Route::prefix('applications')->group(function () {
        Route::post('/{jobId}/apply', function ($jobId) {
            $job = Job::find($jobId);
            if (!$job) return response()->json(['error' => 'Job not found.'], 404);
            return (new JobApplicationController())->startApplication($job);
        });

        Route::post('/{applicationId}/next-step', function ($applicationId, Request $request) {
            return (new JobApplicationController())->nextStep($request, JobApplication::findOrFail($applicationId));
        });

        Route::post('/{applicationId}/back-step', function ($applicationId, Request $request) {
            return (new JobApplicationController())->backStep($request, JobApplication::findOrFail($applicationId));
        });

        Route::get('/{applicationId}/experience', function ($applicationId, Request $request) {
            return (new JobApplicationController())->getExperience($request, JobApplication::findOrFail($applicationId));
        });

        Route::post('/{applicationId}/experience', function ($applicationId, Request $request) {
            return (new JobApplicationController())->saveExperience($request, JobApplication::findOrFail($applicationId));
        });

        Route::get('/{applicationId}/education', function ($applicationId, Request $request) {
            return (new JobApplicationController())->getEducation($request, JobApplication::findOrFail($applicationId));
        });

        Route::post('/{applicationId}/education', function ($applicationId, Request $request) {
            return (new JobApplicationController())->saveEducation($request, JobApplication::findOrFail($applicationId));
        });

        Route::get('/{applicationId}/certifications', function ($applicationId, Request $request) {
            return (new JobApplicationController())->getCertifications($request, JobApplication::findOrFail($applicationId));
        });

        Route::post('/{applicationId}/certifications', function ($applicationId, Request $request) {
            return (new JobApplicationController())->saveCertifications($request, JobApplication::findOrFail($applicationId));
        });

        Route::post('/{applicationId}/submit', function ($applicationId) {
            return (new JobApplicationController())->submitApplication(JobApplication::findOrFail($applicationId));
        });
    });

    Route::get('/user/applications', [JobApplicationController::class, 'getUserApplications']);

    // Employer routes
    Route::prefix('employer')->group(function () {
        Route::get('jobs', [JobController::class, 'getEmployerJobs']);
        Route::post('jobs', [JobController::class, 'store']);
        Route::get('applicants', [JobApplicationController::class, 'getEmployerApplicants']);
        Route::get('applicants/{applicationId}', function ($applicationId) {
            return (new JobApplicationController())->showApplicantDetails(JobApplication::findOrFail($applicationId));
        });
        Route::post('applicants/{applicationId}/status', function ($applicationId, Request $request) {
            return (new JobApplicationController())->updateApplicationStatus($request, JobApplication::findOrFail($applicationId));
        });
        Route::post('applicants/{applicationId}/request-documents', function ($applicationId, Request $request) {
            return (new JobApplicationController())->requestAdditionalDocuments($request, JobApplication::findOrFail($applicationId));
        });
        Route::get('applicant-counts', [JobApplicationController::class, 'getApplicantCounts']);
        Route::get('jobs/{jobId}/applicants', function ($jobId) {
            return (new JobApplicationController())->getApplicantsForJob(Job::findOrFail($jobId), request());
        });
        Route::get('latest-activities', [JobApplicationController::class, 'getLatestActivities']);
        Route::post('applicants/{applicationId}/schedule-interview', function ($applicationId, Request $request) {
            return (new JobApplicationController())->scheduleInterview($request, JobApplication::findOrFail($applicationId));
        });
        Route::get('/scheduled-interviews', [JobApplicationController::class, 'getScheduledInterviews']);
    });

    // Events (protected)
    Route::prefix('events')->group(function () {
        Route::post('/', [EventController::class, 'store']);
        Route::get('/{id}', [EventController::class, 'show']);
        Route::put('/{id}', [EventController::class, 'update']);
        Route::delete('/{id}', [EventController::class, 'destroy']);
    });

});





