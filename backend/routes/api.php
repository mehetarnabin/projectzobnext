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

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/companies/search', function (Request $request) {
    $query = $request->input('query');
    if (!$query) return response()->json([]);
    return Company::where('name', 'like', "%{$query}%")
                  ->select('id','name')
                  ->limit(10)
                  ->get();
});

// Public: Jobs
Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{jobId}', function($jobId){
    $job = Job::find($jobId);
    if(!$job) return response()->json(['error'=>'Job not found'],404);
    return (new JobController())->show($job, request());
})->name('jobs.show');

// Public: Events
Route::get('/events', [EventController::class,'index']);
Route::get('/events/{id}', [EventController::class,'show']);

// Public: Users & Contact
Route::get('/users', [UserController::class,'index']);
Route::post('/contact', [ContactController::class,'store']);

/*
|--------------------------------------------------------------------------
| Protected Routes (JWT Auth)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {

    // Auth
    Route::get('/user', [AuthController::class,'getAuthenticatedUser']);
    Route::post('/logout', [AuthController::class,'logout']);
    Route::post('/refresh', [AuthController::class,'refresh']);

    // Jobs
    Route::post('/jobs', [JobController::class,'store']);
    Route::put('/jobs/{job}', [JobController::class,'update']);
    Route::delete('/jobs/{job}', [JobController::class,'destroy']);

    // Events
    Route::post('/events', [EventController::class,'store']);
    Route::put('/events/{id}', [EventController::class,'update']);
    Route::delete('/events/{id}', [EventController::class,'destroy']);

    // Profile
    Route::prefix('profile')->group(function(){
        Route::get('/', [ProfileController::class,'show']);
        Route::post('/header', [ProfileController::class,'updateHeader']);
        Route::post('/basic-info', [ProfileController::class,'updateBasicInfo']);
        Route::post('/about-me', [ProfileController::class,'updateAboutMe']);
        Route::post('/education', [ProfileController::class,'updateEducation']);
        Route::post('/work-experience', [ProfileController::class,'updateWorkExperience']);
        Route::post('/memberships', [ProfileController::class,'updateMemberships']);
        Route::post('/certifications', [ProfileController::class,'updateCertifications']);
        Route::post('/licenses', [ProfileController::class,'updateLicenses']);
    });

    // Employer Profile
    Route::prefix('employer-profile')->group(function(){
        Route::get('/', [ProfileController::class,'showEmployerProfile']);
        Route::post('/company-header', [ProfileController::class,'updateCompanyHeader']);
        Route::post('/user-profile', [ProfileController::class,'updateEmployerUserProfile']);
        Route::get('/managers', function(){
            $user = Auth::user();
            if(!$user || !$user->company_id) return response()->json(['message'=>'Unauthorized'],401);

            $managers = User::where('company_id',$user->company_id)
                            ->where('designation','Manager')
                            ->select('id','name','designation','email','phone_number')
                            ->get()
                            ->map(function($manager){
                                $profile = $manager->profile()->first();
                                $manager->logo_url = $profile ? 
                                    (str_starts_with($profile->logo_url,'images/default_') ? asset($profile->logo_url) : asset('storage/'.$profile->logo_url))
                                    : asset('images/default_profile.jpg');
                                return $manager;
                            });
            return response()->json($managers);
        });
    });

    // Job Applications
    Route::prefix('applications')->group(function(){
        Route::post('/{jobId}/apply', function($jobId){
            $job = Job::find($jobId);
            if(!$job) return response()->json(['error'=>'Job not found'],404);
            return (new JobApplicationController())->startApplication($job);
        });

        Route::post('/{applicationId}/next-step', function($id, Request $req){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Application not found'],404);
            return (new JobApplicationController())->nextStep($req,$app);
        });

        Route::post('/{applicationId}/back-step', function($id, Request $req){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Application not found'],404);
            return (new JobApplicationController())->backStep($req,$app);
        });

        Route::get('/{applicationId}/experience', function($id, Request $req){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Application not found'],404);
            return (new JobApplicationController())->getExperience($req,$app);
        });
        Route::post('/{applicationId}/experience', function($id, Request $req){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Application not found'],404);
            return (new JobApplicationController())->saveExperience($req,$app);
        });

        Route::get('/{applicationId}/education', function($id, Request $req){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Application not found'],404);
            return (new JobApplicationController())->getEducation($req,$app);
        });
        Route::post('/{applicationId}/education', function($id, Request $req){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Application not found'],404);
            return (new JobApplicationController())->saveEducation($req,$app);
        });

        Route::get('/{applicationId}/certifications', function($id, Request $req){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Application not found'],404);
            return (new JobApplicationController())->getCertifications($req,$app);
        });
        Route::post('/{applicationId}/certifications', function($id, Request $req){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Application not found'],404);
            return (new JobApplicationController())->saveCertifications($req,$app);
        });

        Route::post('/{applicationId}/submit', function($id){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Application not found'],404);
            return (new JobApplicationController())->submitApplication($app);
        });

        Route::get('/user', [JobApplicationController::class,'getUserApplications']);
    });

    // Employer routes
    Route::prefix('employer')->group(function(){
        Route::get('jobs',[JobController::class,'getEmployerJobs']);
        Route::post('jobs',[JobController::class,'store']);
        Route::get('applicants',[JobApplicationController::class,'getEmployerApplicants']);
        Route::get('applicants/{id}', function($id){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Not found'],404);
            return (new JobApplicationController())->showApplicantDetails($app);
        });
        Route::post('applicants/{id}/status', function($id, Request $req){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Not found'],404);
            return (new JobApplicationController())->updateApplicationStatus($req,$app);
        });
        Route::post('applicants/{id}/request-documents', function($id, Request $req){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Not found'],404);
            return (new JobApplicationController())->requestAdditionalDocuments($req,$app);
        });
        Route::get('applicant-counts',[JobApplicationController::class,'getApplicantCounts']);
        Route::get('jobs/{jobId}/applicants', function($jobId){
            $job = Job::find($jobId);
            if(!$job) return response()->json(['error'=>'Job not found'],404);
            return (new JobApplicationController())->getApplicantsForJob($job,request());
        });
        Route::get('latest-activities',[JobApplicationController::class,'getLatestActivities']);
        Route::post('applicants/{id}/schedule-interview', function($id, Request $req){
            $app = JobApplication::find($id);
            if(!$app) return response()->json(['error'=>'Not found'],404);
            return (new JobApplicationController())->scheduleInterview($req,$app);
        });
        Route::get('scheduled-interviews',[JobApplicationController::class,'getScheduledInterviews']);
    });

});





