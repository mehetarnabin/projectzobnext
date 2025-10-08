
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
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SubscriptionPlanController;
use App\Http\Controllers\StripeController;
use App\Http\Controllers\SubscriptionController;
use App\Models\Job;
use App\Models\Company;
use App\Models\User;

// ==================== Public Routes ====================

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Company search
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

        return response()->json([
            'status' => 'success',
            'database' => $dbName,
            'job_found' => (bool) $job,
            'job' => $job ? [
                'id' => $job->id,
                'title' => $job->title,
                'is_published' => $job->is_published
            ] : null
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Database connection failed: ' . $e->getMessage(),
            'error_details' => [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]
        ], 500);
    }
});

// Public jobs()
Route::get('/jobs',[JobController::class,'index']);
Route::get('/jobs/featured', [JobController::class, 'paidJobs']);
Route::get('/jobs/{job}', [JobController::class, 'show'])->name('jobs.show');
Route::get('/categories-with-count', [JobController::class, 'categoriesWithCount']);
//Route::get('/jobs/categories', [JobController::class, 'categoriesWithCount']);
//Route::get('/jobs/featured', [JobController::class, 'featured']);
Route::get('/jobs/trending', [JobController::class, 'trending']);
Route::get('/employers/featured', [JobController::class, 'featuredEmployers']);
Route::get('/filter-options', [JobController::class, 'filterOptions']);
Route::get('/jobs/search', [JobController::class, 'search']);




// Public events
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{slug}', [EventController::class, 'showBySlug']); 


// Contact form
Route::post('/contact', [ContactController::class, 'store']);

// ==================== Protected User Routes ====================
Route::middleware('auth:api')->group(function () {

    // ---------------- Auth ----------------
    Route::get('/user', [AuthController::class, 'getAuthenticatedUser']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // ---------------- Profile ----------------
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

    // ---------------- Stripe Payment ----------------
    Route::post('/create-payment-intent', [StripeController::class, 'createPaymentIntent']); // Paid package
    Route::post('/confirm-payment', [StripeController::class, 'confirmPayment']); // Confirm paid
     // Free package
    Route::post('/confirm-free-package', [StripeController::class, 'confirmFreePackage']);


    // Public subscription plans
    Route::get('/subscription-plans', [SubscriptionPlanController::class, 'index']);
    Route::get('/active-subscription', [SubscriptionController::class, 'active']);


    // ---------------- Jobs ----------------
    Route::post('/jobs', [JobController::class, 'store']); // Create job draft
    Route::put('/jobs/{job}', [JobController::class, 'update']); // Update draft/published job
    Route::delete('/jobs/{job}', [JobController::class, 'destroy']); // Delete job
    Route::get('/employer/jobs', [JobController::class, 'getEmployerJobs']); // List employer jobs


    // ---------------- Job Applications ----------------
    Route::prefix('applications')->group(function () {
        Route::post('/{jobId}/apply', [JobApplicationController::class, 'startApplication']);
        Route::post('/{applicationId}/next-step', [JobApplicationController::class, 'nextStep']);
        Route::post('/{applicationId}/back-step', [JobApplicationController::class, 'backStep']);
        Route::get('/{applicationId}/experience', [JobApplicationController::class, 'getExperience']);
        Route::post('/{applicationId}/experience', [JobApplicationController::class, 'saveExperience']);
        Route::get('/{applicationId}/education', [JobApplicationController::class, 'getEducation']);
        Route::post('/{applicationId}/education', [JobApplicationController::class, 'saveEducation']);
        Route::get('/{applicationId}/certifications', [JobApplicationController::class, 'getCertifications']);
        Route::post('/{applicationId}/certifications', [JobApplicationController::class, 'saveCertifications']);
        Route::post('/{applicationId}/submit', [JobApplicationController::class, 'submitApplication']);
    });
    Route::get('/user/applications', [JobApplicationController::class, 'getUserApplications']);

    // ---------------- Employer Profile ----------------
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
                                $manager->logo_url = $profile 
                                    ? (str_starts_with($profile->logo_url, 'images/default_') 
                                        ? asset($profile->logo_url) 
                                        : asset('storage/' . $profile->logo_url)) 
                                    : asset('images/default_profile.jpg');
                                return $manager;
                            });
            return response()->json($managers);
        });
    });

    // ---------------- Employer Specific ----------------
    Route::prefix('employer')->group(function () {
        Route::get('jobs', [JobController::class, 'getEmployerJobs']);
        Route::get('applicants', [JobApplicationController::class, 'getEmployerApplicants']);
        Route::get('applicants/{applicationId}', [JobApplicationController::class, 'showApplicantDetails']);
        Route::post('applicants/{applicationId}/status', [JobApplicationController::class, 'updateApplicationStatus']);
        Route::post('applicants/{applicationId}/request-documents', [JobApplicationController::class, 'requestAdditionalDocuments']);
        Route::get('applicant-counts', [JobApplicationController::class, 'getApplicantCounts']);
        Route::get('jobs/{jobId}/applicants', [JobApplicationController::class, 'getApplicantsForJob']);
        Route::get('latest-activities', [JobApplicationController::class, 'getLatestActivities']);
        Route::post('applicants/{applicationId}/schedule-interview', [JobApplicationController::class, 'scheduleInterview']);
        Route::get('/scheduled-interviews', [JobApplicationController::class, 'getScheduledInterviews']);
    });

    // ---------------- Event Management ----------------
    Route::prefix('events')->group(function () {
        Route::post('/', [EventController::class, 'store']);
        Route::get('/{id}', [EventController::class, 'show']);
        Route::put('/{id}', [EventController::class, 'update']);
        Route::delete('/{id}', [EventController::class, 'destroy']);
    });
    
});

// ==================== Stripe Webhook (must be public) ====================
Route::post('/stripe/webhook', [StripeController::class, 'handleWebhook']);

// ==================== Admin Routes ====================
Route::prefix('admin')->group(function () {
    Route::post('/register', [AdminController::class, 'register']);
    Route::post('/login', [AdminController::class, 'login']);

    Route::middleware('auth:admin')->group(function () {
        Route::post('/subscription-plans', [SubscriptionPlanController::class, 'store']);
        Route::put('/subscription-plans/{id}', [SubscriptionPlanController::class, 'update']);
        Route::delete('/subscription-plans/{id}', [SubscriptionPlanController::class, 'destroy']);
    });
});
