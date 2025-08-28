<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\CategoryController;
use App\Models\Job; // Keep this if you're manually finding Job in closures
use App\Models\JobApplication; // Keep this if you're manually finding JobApplication in closures
use App\Models\Company; // ADDED: Import Company model
use App\Models\User; // ADDED: Import User model

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ADDED: Route for company search (for autocomplete in registration)
Route::get('/companies/search', function (Request $request) {
    $query = $request->input('query');
    if (!$query) {
        return response()->json([]);
    }
    $companies = Company::where('name', 'like', '%' . $query . '%')
                        ->select('id', 'name')
                        ->limit(10)
                        ->get();
    return response()->json($companies);
});


// TEST ROUTE FOR DB CONNECTION AND JOB FIND (Keep for your debugging, remove in production)
Route::get('/test-db-connection', function () {
    try {
        \DB::connection()->getPdo();
        $dbName = \DB::connection()->getDatabaseName();
        $jobIdToTest = 4;
        $job = \App\Models\Job::find($jobIdToTest);

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

// Routes that require authentication (JWT)
Route::middleware('auth:api')->group(function () {
    // Auth related routes
    Route::get('/user', [AuthController::class, 'getAuthenticatedUser']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Job related routes (for authenticated users like employers/staffing)
    Route::post('/jobs', [JobController::class, 'store']);

    // Profile Routes (unified for jobseeker and employer, logic handled in controller)
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile/header', [ProfileController::class, 'updateHeader']);
    Route::post('/profile/basic-info', [ProfileController::class, 'updateBasicInfo']);
    Route::post('/profile/about-me', [ProfileController::class, 'updateAboutMe']);
    Route::post('/profile/education', [ProfileController::class, 'updateEducation']);
    Route::post('/profile/work-experience', [ProfileController::class, 'updateWorkExperience']);
    Route::post('/profile/memberships', [ProfileController::class, 'updateMemberships']);
    Route::post('/profile/certifications', [ProfileController::class, 'updateCertifications']);
    Route::post('/profile/licenses', [ProfileController::class, 'updateLicenses']);

    // ADDED: Employer specific profile routes
    Route::prefix('employer-profile')->group(function () {
        Route::get('/', [ProfileController::class, 'showEmployerProfile']); // New method to fetch employer specific profile data
        Route::post('/company-header', [ProfileController::class, 'updateCompanyHeader']); // New method to update company header
        Route::post('/user-profile', [ProfileController::class, 'updateEmployerUserProfile']); // New method to update user's info within company
        Route::get('/managers', function (Request $request) { // New route to get managers for a company
            $user = Auth::user();
            if (!$user || !$user->company_id) {
                return response()->json(['message' => 'Unauthorized or not associated with a company'], 401);
            }
            // Fetch users in the same company who have 'Manager' designation
            $managers = User::where('company_id', $user->company_id)
                            ->where('designation', 'Manager') // Assuming 'Manager' as designation
                            ->select('id', 'name', 'designation', 'email', 'phone_number') // Select relevant manager fields
                            ->get();

            // Fetch manager's profile logo if available
            $managers = $managers->map(function ($manager) {
                $profile = $manager->profile()->first();
                $manager->logo_url = $profile ? (str_starts_with($profile->logo_url, 'images/default_') ? asset($profile->logo_url) : asset('storage/' . $profile->logo_url)) : asset('images/default_profile.jpg');
                return $manager;
            });
            return response()->json($managers);
        });
    });


    // Job Application Routes (Job Seeker side) - Explicitly resolve models
    Route::post('/jobs/{jobId}/apply', function ($jobId) {
        $job = Job::find($jobId);
        if (!$job) {
            return response()->json(['error' => 'Job not found for application.'], 404);
        }
        $controller = new JobApplicationController();
        return $controller->startApplication($job);
    });

    Route::post('/applications/{applicationId}/next-step', function ($applicationId, Request $request) {
        $jobApplication = JobApplication::find($applicationId);
        if (!$jobApplication) { return response()->json(['error' => 'Job Application not found.'], 404); }
        $controller = new JobApplicationController();
        return $controller->nextStep($request, $jobApplication);
    });

    Route::post('/applications/{applicationId}/back-step', function ($applicationId, Request $request) {
        $jobApplication = JobApplication::find($applicationId);
        if (!$jobApplication) { return response()->json(['error' => 'Job Application not found.'], 404); }
        $controller = new JobApplicationController();
        return $controller->backStep($request, $jobApplication);
    });

    Route::get('/applications/{applicationId}/experience', function ($applicationId, Request $request) {
        $jobApplication = JobApplication::find($applicationId);
        if (!$jobApplication) { return response()->json(['error' => 'Job Application not found.'], 404); }
        $controller = new JobApplicationController();
        return $controller->getExperience($request, $jobApplication);
    });

    Route::post('/applications/{applicationId}/experience', function ($applicationId, Request $request) {
        $jobApplication = JobApplication::find($applicationId);
        if (!$jobApplication) { return response()->json(['error' => 'Job Application not found.'], 404); }
        $controller = new JobApplicationController();
        return $controller->saveExperience($request, $jobApplication);
    });

    Route::get('/applications/{applicationId}/education', function ($applicationId, Request $request) {
        $jobApplication = JobApplication::find($applicationId);
        if (!$jobApplication) { return response()->json(['error' => 'Job Application not found.'], 404); }
        $controller = new JobApplicationController();
        return $controller->getEducation($request, $jobApplication);
    });

    Route::post('/applications/{applicationId}/education', function ($applicationId, Request $request) {
        $jobApplication = JobApplication::find($applicationId);
        if (!$jobApplication) { return response()->json(['error' => 'Job Application not found.'], 404); }
        $controller = new JobApplicationController();
        return $controller->saveEducation($request, $jobApplication);
    });

    Route::get('/applications/{applicationId}/certifications', function ($applicationId, Request $request) {
        $jobApplication = JobApplication::find($applicationId);
        if (!$jobApplication) { return response()->json(['error' => 'Job Application not found.'], 404); }
        $controller = new JobApplicationController();
        return $controller->getCertifications($request, $jobApplication);
    });

    Route::post('/applications/{applicationId}/certifications', function ($applicationId, Request $request) {
        $jobApplication = JobApplication::find($applicationId);
        if (!$jobApplication) { return response()->json(['error' => 'Job Application not found.'], 404); }
        $controller = new JobApplicationController();
        return $controller->saveCertifications($request, $jobApplication);
    });

    Route::post('/applications/{applicationId}/submit', function ($applicationId) {
        $jobApplication = JobApplication::find($applicationId);
        if (!$jobApplication) { return response()->json(['error' => 'Job Application not found.'], 404); }
        $controller = new JobApplicationController();
        return $controller->submitApplication($jobApplication);
    });

    Route::get('/user/applications', [JobApplicationController::class, 'getUserApplications']);

    // Employer specific routes
    Route::prefix('employer')->/*middleware('role:employer')->*/group(function () {
        Route::get('jobs', [JobController::class, 'getEmployerJobs']);
        Route::post('jobs', [JobController::class, 'store']);

        // Applicant Management (NEW ROUTES - Explicitly resolve models)
        Route::get('applicants', [JobApplicationController::class, 'getEmployerApplicants']);

        Route::get('applicants/{applicationId}', function ($applicationId) {
            $jobApplication = JobApplication::find($applicationId);
            if (!$jobApplication) {
                return response()->json(['error' => 'Job Application not found for employer.'], 404);
            }
            $controller = new JobApplicationController();
            return $controller->showApplicantDetails($jobApplication);
        });

        Route::post('applicants/{applicationId}/status', function ($applicationId, Request $request) {
            $jobApplication = JobApplication::find($applicationId);
            if (!$jobApplication) { return response()->json(['error' => 'Job Application not found.'], 404); }
            $controller = new JobApplicationController();
            return $controller->updateApplicationStatus($request, $jobApplication);
        });

        Route::post('applicants/{applicationId}/request-documents', function ($applicationId, Request $request) {
            $jobApplication = JobApplication::find($applicationId);
            if (!$jobApplication) { return response()->json(['error' => 'Job Application not found.'], 404); }
            $controller = new JobApplicationController();
            return $controller->requestAdditionalDocuments($request, $jobApplication);
        });

        Route::get('applicant-counts', [JobApplicationController::class, 'getApplicantCounts']);

        Route::get('jobs/{jobId}/applicants', function ($jobId) {
            $job = Job::find($jobId);
            if (!$job) {
                return response()->json(['error' => 'Job not found for applicants list.'], 404);
            }
            $controller = new JobApplicationController();
            return $controller->getApplicantsForJob($job, request());
        });

        Route::get('latest-activities', [JobApplicationController::class, 'getLatestActivities']);

        Route::post('applicants/{applicationId}/schedule-interview', function ($applicationId, Request $request) {
            $jobApplication = JobApplication::find($applicationId);
            if (!$jobApplication) {
                return response()->json(['error' => 'Job Application not found for interview scheduling.'], 404);
            }
            $controller = new JobApplicationController();
            return $controller->scheduleInterview($request, $jobApplication);
        });

        Route::get('/scheduled-interviews', [JobApplicationController::class, 'getScheduledInterviews']);
    });

    // Job management (update/delete - ownership checked in JobController)
    Route::put('/jobs/{job}', [JobController::class, 'update']);
    Route::delete('/jobs/{job}', [JobController::class, 'destroy']);
});

// Public routes (no authentication required)
Route::get('/users', [UserController::class, 'index']);
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{jobId}', function ($jobId) {
    $job = Job::find($jobId);
    if (!$job) {
        return response()->json(['error' => 'Job not found via explicit route resolver.'], 404);
    }
    $controller = new JobController();
    return $controller->show($job, request());
})->name('jobs.show');

