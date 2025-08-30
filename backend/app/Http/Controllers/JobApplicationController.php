<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use App\Models\Profile;
use App\Models\JobApplication;
use App\Models\ApplicationExperience;
use App\Models\ApplicationEducation;
use App\Models\ApplicationCertification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class JobApplicationController extends Controller
{
    /**
     * Start a new job application or return existing one if already applied.
     *
     * @param Job $job
     * @return \Illuminate\Http\JsonResponse
     */
    public function startApplication(Job $job)
    {
        $user = Auth::user();

        if (!$user) {
            Log::warning('Attempted to start application without authentication.');
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $existingApplication = JobApplication::where('user_id', $user->id)
                                             ->where('job_id', $job->id)
                                             ->first();

        if ($existingApplication) {
            Log::info('User attempted to re-apply for a job.', [
                'user_id' => $user->id,
                'job_id' => $job->id,
                'existing_application_id' => $existingApplication->id
            ]);
            return response()->json([
                'message' => 'You have already applied for this job.',
                'application_id' => $existingApplication->id,
                // Ensure current_step is always a string for consistency with frontend
                'current_step' => $existingApplication->current_step,
                'status' => $existingApplication->status,
                'already_applied' => true
            ], 409);
        }

        // If no existing application, create a new one
        $jobApplication = JobApplication::create([
            'user_id' => $user->id,
            'job_id' => $job->id,
            'current_step' => 'personal_details', // Changed from 1 to 'personal_details' (string)
            'status' => 'draft', // Initial status
        ]);

        Log::info('New job application started.', [
            'application_id' => $jobApplication->id,
            'user_id' => $user->id,
            'job_id' => $job->id
        ]);

        return response()->json([
            'message' => 'Job application started successfully.',
            'application_id' => $jobApplication->id,
            'current_step' => $jobApplication->current_step, // Will be 'personal_details'
            'status' => $jobApplication->status,
            'already_applied' => false
        ], 200);
    }

    /**
     * Get experience data for the application step.
     */
    public function getExperience(Request $request, JobApplication $jobApplication)
    {
        if ($jobApplication->user_id !== Auth::id()) {
            Log::warning('JobApplicationController@getExperience: Unauthorized access attempt.', [
                'application_id' => $jobApplication->id,
                'application_owner_id' => $jobApplication->user_id,
                'attempting_user_id' => Auth::id(),
                'source' => $request->query('source', 'application'),
            ]);
            return response()->json(['error' => 'Unauthorized access to application.'], 403);
        }

        $source = $request->query('source', 'application');

        Log::info('JobApplicationController@getExperience: Fetching experiences.', [
            'application_id' => $jobApplication->id,
            'user_id' => Auth::id(),
            'source_requested' => $source,
        ]);


        if ($source === 'profile') {
            $profile = $jobApplication->user->profile;

            Log::info('JobApplicationController@getExperience: Profile data retrieved for user.', [
                'user_id' => Auth::id(),
                'profile_exists' => (bool)$profile,
                'profile_work_experience_raw' => $profile ? $profile->getRawOriginal('work_experience') : 'N/A (no profile)',
                'profile_work_experience_cast' => $profile ? $profile->work_experience : 'N/A (no profile)',
                'profile_work_experience_empty_check' => $profile ? empty($profile->work_experience) : 'N/A (no profile)',
            ]);

            if ($profile && !empty($profile->work_experience)) {
                $formattedExperiences = collect($profile->work_experience)->map(function($exp) {
                    $startDate = $exp['startDate'] ?? null;
                    $endDate = $exp['endDate'] ?? null;
                    $currentJob = false;

                    if ($endDate === null || $endDate === 'Present') {
                        $currentJob = true;
                        $endDate = null;
                    }

                    return [
                        'id' => uniqid(),
                        'job_title' => $exp['title'] ?? '',
                        'company' => $exp['company'] ?? '',
                        'start_date' => $startDate ? Carbon::parse($startDate)->format('Y-m-d') : '',
                        'end_date' => $endDate ? Carbon::parse($endDate)->format('Y-m-d') : null,
                        'description' => $exp['details'] ?? null,
                        'current_job' => $currentJob,
                    ];
                })->toArray();

                Log::info('JobApplicationController@getExperience: Returning profile experiences (mapped).', [
                    'count' => count($formattedExperiences),
                    'experiences' => $formattedExperiences,
                ]);

                return response()->json([
                    'source' => 'profile',
                    'experiences' => $formattedExperiences
                ]);
            } else {
                Log::info('JobApplicationController@getExperience: No work experience found in profile or profile does not exist.');
                return response()->json([
                    'source' => 'profile',
                    'experiences' => [],
                    'message' => 'No work experience found in your profile.'
                ]);
            }
        } else {
            $applicationExperiences = $jobApplication->experiences->map(function ($exp) {
                return [
                    'id' => $exp->id,
                    'job_title' => $exp->job_title,
                    'company' => $exp->company,
                    'start_date' => $exp->start_date->format('Y-m-d'),
                    'end_date' => $exp->end_date ? $exp->end_date->format('Y-m-d') : null,
                    'description' => $exp->description,
                    'current_job' => $exp->current_job,
                ];
            });

            Log::info('JobApplicationController@getExperience: Returning application experiences.', [
                'count' => count($applicationExperiences),
                'experiences' => $applicationExperiences,
            ]);

            return response()->json([
                'source' => 'application',
                'experiences' => $applicationExperiences,
                'message' => 'Successfully loaded application experiences.'
            ]);
        }
    }

    /**
     * Save/update experience data for the current job application.
     */
    public function saveExperience(Request $request, JobApplication $jobApplication)
    {
        if ($jobApplication->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized access to application.'], 403);
        }

        try {
            $validated = $request->validate([
                'experiences' => 'required|array',
                'experiences.*.job_title' => 'required|string|max:255',
                'experiences.*.company' => 'required|string|max:255',
                'experiences.*.start_date' => 'required|date',
                'experiences.*.end_date' => 'nullable|date|after_or_equal:experiences.*.start_date',
                'experiences.*.description' => 'nullable|string',
                'experiences.*.current_job' => 'boolean',
            ]);
        } catch (ValidationException $e) {
            Log::error('Experience Validation Failed:', ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        }

        $jobApplication->experiences()->delete(); // Delete existing
        foreach ($validated['experiences'] as $experienceData) {
            $jobApplication->experiences()->create($experienceData);
        }

        $jobApplication->update(['current_step' => 'experience_details_complete']);

        return response()->json([
            'message' => 'Experience details saved successfully.',
            'application_id' => $jobApplication->id,
            'experiences' => $jobApplication->experiences->map(function($exp) {
                return [
                    'id' => $exp->id,
                    'job_title' => $exp->job_title,
                    'company' => $exp->company,
                    'start_date' => $exp->start_date->format('Y-m-d'),
                    'end_date' => $exp->end_date ? $exp->end_date->format('Y-m-d') : null,
                    'description' => $exp->description,
                    'current_job' => $exp->current_job,
                ];
            })
        ], 200);
    }

    /**
     * Get education data for the application step.
     * Can load from application's stored education or from user's profile.
     *
     * @param Request $request
     * @param JobApplication $jobApplication The job application instance.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEducation(Request $request, JobApplication $jobApplication)
    {
        if ($jobApplication->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized access to application.'], 403);
        }

        $source = $request->query('source', 'application');
        Log::info('JobApplicationController@getEducation: Fetching education.', [
            'application_id' => $jobApplication->id,
            'user_id' => Auth::id(),
            'source_requested' => $source,
        ]);

        if ($source === 'profile') {
            $profile = $jobApplication->user->profile;
            Log::info('JobApplicationController@getEducation: Profile data retrieved for user.', [
                'profile_exists' => (bool)$profile,
                'profile_education_raw' => $profile ? $profile->getRawOriginal('education') : 'N/A (no profile)',
                'profile_education_cast' => $profile ? $profile->education : 'N/A (no profile)',
            ]);

            if ($profile && !empty($profile->education)) {
                $formattedEducation = collect($profile->education)->map(function($edu) {
                    $startDate = $edu['startDate'] ?? null;
                    $endDate = $edu['endDate'] ?? null;
                    return [
                        'id' => uniqid(),
                        'degree' => $edu['degree'] ?? '',
                        'institution' => $edu['institution'] ?? '',
                        'field_of_study' => $edu['fieldOfStudy'] ?? null, // Assuming this exists in profile data
                        'start_date' => $startDate ? Carbon::parse($startDate)->format('Y-m-d') : '',
                        'end_date' => $endDate ? Carbon::parse($endDate)->format('Y-m-d') : null,
                        'grade' => $edu['grade'] ?? null,
                        'honors' => $edu['honors'] ?? false,
                        'highlights' => $edu['highlights'] ?? null, // Map 'highlights' from profile
                    ];
                })->toArray();

                Log::info('JobApplicationController@getEducation: Returning profile education (mapped).', [
                    'count' => count($formattedEducation),
                    'education' => $formattedEducation,
                ]);
                return response()->json([
                    'source' => 'profile',
                    'education' => $formattedEducation
                ]);
            } else {
                Log::info('JobApplicationController@getEducation: No education found in profile or profile does not exist.');
                return response()->json(['source' => 'profile', 'education' => [], 'message' => 'No education found in your profile.']);
            }
        } else {
            $applicationEducation = $jobApplication->educations->map(function ($edu) {
                return [
                    'id' => $edu->id,
                    'degree' => $edu->degree,
                    'institution' => $edu->institution,
                    'field_of_study' => $edu->field_of_study,
                    'start_date' => $edu->start_date ? $edu->start_date->format('Y-m-d') : '',
                    'end_date' => $edu->end_date ? $edu->end_date->format('Y-m-d') : null,
                    'grade' => $edu->grade,
                    'honors' => $edu->honors,
                    'highlights' => $edu->highlights,
                ];
            });
            Log::info('JobApplicationController@getEducation: Returning application education.', [
                'count' => count($applicationEducation),
                'education' => $applicationEducation,
            ]);
            return response()->json(['source' => 'application', 'education' => $applicationEducation, 'message' => 'Successfully loaded application education.']);
        }
    }

    /**
     * Save/update education data for the current job application.
     *
     * @param Request $request
     * @param JobApplication $jobApplication
     * @return \Illuminate\Http\JsonResponse
     */
    public function saveEducation(Request $request, JobApplication $jobApplication)
    {
        if ($jobApplication->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized access to application.'], 403);
        }

        try {
            $validated = $request->validate([
                'education' => 'required|array',
                'education.*.degree' => 'required|string|max:255',
                'education.*.institution' => 'required|string|max:255',
                'education.*.field_of_study' => 'nullable|string|max:255',
                'education.*.start_date' => 'nullable|date',
                'education.*.end_date' => 'nullable|date|after_or_equal:education.*.start_date',
                'education.*.grade' => 'nullable|string|max:255',
                'education.*.honors' => 'boolean',
                'education.*.highlights' => 'nullable|string',
            ]);
        } catch (ValidationException $e) {
            Log::error('Education Validation Failed:', ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        }

        $jobApplication->educations()->delete();
        foreach ($validated['education'] as $eduData) {
            $jobApplication->educations()->create($eduData);
        }

        // Update step only if it's currently 'education_certificates' or earlier
        // This ensures saving education also marks the step as complete for submission check
        if ($jobApplication->current_step === 'education_certificates' || $jobApplication->current_step === 'experience_details_complete') {
             $jobApplication->update(['current_step' => 'education_certificates_complete']);
        }


        return response()->json([
            'message' => 'Education details saved successfully.',
            'application_id' => $jobApplication->id,
            'education' => $jobApplication->educations->map(function($edu) {
                return [
                    'id' => $edu->id,
                    'degree' => $edu->degree,
                    'institution' => $edu->institution,
                    'field_of_study' => $edu->field_of_study,
                    'start_date' => $edu->start_date ? $edu->start_date->format('Y-m-d') : '',
                    'end_date' => $edu->end_date ? $edu->end_date->format('Y-m-d') : null,
                    'grade' => $edu->grade,
                    'honors' => $edu->honors,
                    'highlights' => $edu->highlights,
                ];
            })
        ], 200);
    }

    /**
     * Get certification data for the application step.
     * Can load from application's stored certifications or from user's profile.
     *
     * @param Request $request
     * @param JobApplication $jobApplication The job application instance.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCertifications(Request $request, JobApplication $jobApplication)
    {
        if ($jobApplication->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized access to application.'], 403);
        }

        $source = $request->query('source', 'application');
        Log::info('JobApplicationController@getCertifications: Fetching certifications.', [
            'application_id' => $jobApplication->id,
            'user_id' => Auth::id(),
            'source_requested' => $source,
        ]);

        if ($source === 'profile') {
            $profile = $jobApplication->user->profile;
            Log::info('JobApplicationController@getCertifications: Profile data retrieved for user.', [
                'profile_exists' => (bool)$profile,
                'profile_certifications_raw' => $profile ? $profile->getRawOriginal('certifications') : 'N/A (no profile)',
                'profile_certifications_cast' => $profile ? $profile->certifications : 'N/A (no profile)',
            ]);

            if ($profile && !empty($profile->certifications)) {
                $formattedCertifications = collect($profile->certifications)->map(function($cert) {
                    return [
                        'id' => uniqid(),
                        'title' => $cert['title'] ?? '',
                        'provider' => $cert['provider'] ?? null,
                        'country' => $cert['country'] ?? null,
                        'year' => (string)($cert['year'] ?? ''),
                        'expiry' => $cert['expiry'] ?? null,
                        'credential_id' => $cert['credentialId'] ?? null, // Assuming 'credentialId' in profile
                        'credential_url' => $cert['credentialUrl'] ?? null, // Assuming 'credentialUrl' in profile
                    ];
                })->toArray();

                Log::info('JobApplicationController@getCertifications: Returning profile certifications (mapped).', [
                    'count' => count($formattedCertifications),
                    'certifications' => $formattedCertifications,
                ]);
                return response()->json([
                    'source' => 'profile',
                    'certifications' => $formattedCertifications
                ]);
            } else {
                Log::info('JobApplicationController@getCertifications: No certifications found in profile or profile does not exist.');
                return response()->json(['source' => 'profile', 'certifications' => [], 'message' => 'No certifications found in your profile.']);
            }
        } else {
            $applicationCertifications = $jobApplication->certifications->map(function ($cert) {
                return [
                    'id' => $cert->id,
                    'title' => $cert->title,
                    'provider' => $cert->provider,
                    'country' => $cert->country,
                    'year' => $cert->year,
                    'expiry' => $cert->expiry,
                    'credential_id' => $cert->credential_id,
                    'credential_url' => $cert->credential_url,
                ];
            });
            Log::info('JobApplicationController@getCertifications: Returning application certifications.', [
                'count' => count($applicationCertifications),
                'certifications' => $applicationCertifications,
            ]);
            return response()->json(['source' => 'application', 'certifications' => $applicationCertifications, 'message' => 'Successfully loaded application certifications.']);
        }
    }

    /**
     * Save/update certification data for the current job application.
     *
     * @param Request $request
     * @param JobApplication $jobApplication
     * @return \Illuminate\Http\JsonResponse
     */
    public function saveCertifications(Request $request, JobApplication $jobApplication)
    {
        if ($jobApplication->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized access to application.'], 403);
        }

        try {
            $validated = $request->validate([
                'certifications' => 'array', // Allow empty array if user chooses not to provide
                'certifications.*.title' => 'required|string|max:255',
                'certifications.*.provider' => 'nullable|string|max:255',
                'certifications.*.country' => 'nullable|string|max:255',
                'certifications.*.year' => 'nullable|string|max:4',
                'certifications.*.expiry' => 'nullable|string|max:255',
                'certifications.*.credential_id' => 'nullable|string|max:255',
                'certifications.*.credential_url' => 'nullable|url|max:255',
            ]);
        } catch (ValidationException $e) {
            Log::error('Certifications Validation Failed:', ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        }

        $jobApplication->certifications()->delete();
        foreach ($validated['certifications'] as $certData) {
            $jobApplication->certifications()->create($certData);
        }

        // Update step only if it's currently 'education_certificates' or earlier
        // This ensures saving certifications also marks the step as complete for submission check
        if ($jobApplication->current_step === 'education_certificates' || $jobApplication->current_step === 'experience_details_complete') {
             $jobApplication->update(['current_step' => 'education_certificates_complete']);
        }

        return response()->json([
            'message' => 'Certification details saved successfully.',
            'application_id' => $jobApplication->id,
            'certifications' => $jobApplication->certifications->map(function($cert) {
                return [
                    'id' => $cert->id,
                    'title' => $cert->title,
                    'provider' => $cert->provider,
                    'country' => $cert->country,
                    'year' => $cert->year,
                    'expiry' => $cert->expiry,
                    'credential_id' => $cert->credential_id,
                    'credential_url' => $cert->credential_url,
                ];
            })
        ], 200);
    }


    /**
     * Submit the job application.
     *
     * @param JobApplication $jobApplication The job application instance.
     * @return \Illuminate\Http\JsonResponse
     */
    public function submitApplication(JobApplication $jobApplication)
    {
        Log::info('JobApplicationController@submitApplication: Attempting to submit application.', [
            'application_id' => $jobApplication->id,
            'application_owner_id' => $jobApplication->user_id,
            'authenticated_user_id' => Auth::id(),
            'current_step_on_submit' => $jobApplication->current_step, // Log current step at time of submit
        ]);

        if ($jobApplication->user_id !== Auth::id()) {
            Log::warning('JobApplicationController@submitApplication: Unauthorized access attempt.', [
                'application_id' => $jobApplication->id,
                'application_owner_id' => $jobApplication->user_id,
                'attempting_user_id' => Auth::id(),
            ]);
            return response()->json(['error' => 'Unauthorized access to application.'], 403);
        }

        // Simplified check for submission: Must be at least at 'review_submit' stage
        // The frontend is responsible for ensuring data is saved before navigating to review.
        if ($jobApplication->current_step !== 'review_submit') {
            Log::warning('JobApplicationController@submitApplication: Attempted to submit application from incorrect step.', [
                'application_id' => $jobApplication->id,
                'current_step' => $jobApplication->current_step,
            ]);
            return response()->json(['error' => 'Application is not ready for submission. Please ensure all steps are complete and saved.'], 400);
        }

        // Update application status and current step
        $jobApplication->update([
            'status' => 'submitted',
            'current_step' => 'submitted',
        ]);

        Log::info('JobApplicationController@submitApplication: Application submitted successfully.', [
            'application_id' => $jobApplication->id,
            'new_status' => $jobApplication->status,
        ]);

        return response()->json([
            'message' => 'Job application submitted successfully!',
            'application_id' => $jobApplication->id,
            'status' => $jobApplication->status,
        ], 200);
    }


    /**
     * Navigate to the next step of the application.
     *
     * @param Request $request
     * @param JobApplication $jobApplication
     * @return \Illuminate\Http\JsonResponse
     */
    public function nextStep(Request $request, JobApplication $jobApplication)
    {
        Log::info('JobApplicationController@nextStep: Attempting to move step.', [
            'route_param_jobApplication_id' => $request->route('jobApplication'),
            'resolved_jobApplication_id' => $jobApplication->id ?? 'NOT RESOLVED',
            'resolved_jobApplication_user_id' => $jobApplication->user_id ?? 'N/A',
            'authenticated_user_id' => Auth::id(),
            'current_backend_step' => $jobApplication->current_step, // Log backend's current step
            'requested_frontend_step' => $request->input('requested_step_number'), // NEW: Log frontend's requested step
        ]);

        if (!$jobApplication->id) {
            Log::warning('JobApplicationController@nextStep: JobApplication model not resolved by Route Model Binding.', [
                'route_param' => $request->route('jobApplication')
            ]);
            return response()->json(['error' => 'Job Application not found or unauthorized.'], 404);
        }

        if ($jobApplication->user_id !== Auth::id()) {
            Log::warning('JobApplicationController@nextStep: Unauthorized access attempt.', [
                'application_id' => $jobApplication->id,
                'application_owner_id' => $jobApplication->user_id,
                'attempting_user_id' => Auth::id(),
            ]);
            return response()->json(['error' => 'Unauthorized access to application.'], 403);
        }

        // NEW LOGIC: Determine the next step purely sequentially based on frontend's request
        // This makes the backend's step progression follow the frontend's wizard order,
        // rather than skipping based on backend 'complete' flags.
        $currentFrontendStepNumber = $request->input('requested_step_number'); // Frontend sends this
        $newBackendStep = 'personal_details'; // Default

        switch ($currentFrontendStepNumber) {
            case 1: // From Personal Details
                $newBackendStep = 'experience_details';
                break;
            case 2: // From Experience
                $newBackendStep = 'education_certificates';
                break;
            case 3: // From Education & Certs
                $newBackendStep = 'review_submit';
                break;
            case 4: // From Review & Submit (implies submission is next)
                $newBackendStep = 'submitted';
                break;
            default:
                $newBackendStep = $jobApplication->current_step; // Stay on current if unknown
                Log::warning('JobApplicationController@nextStep: Unknown frontend step number received.', [
                    'requested_step_number' => $currentFrontendStepNumber
                ]);
                break;
        }

        // Only update if the step is actually changing
        if ($jobApplication->current_step !== $newBackendStep) {
            $jobApplication->update(['current_step' => $newBackendStep]);
            Log::info('JobApplicationController@nextStep: Successfully moved to next step.', ['new_step' => $newBackendStep]);
        } else {
             Log::info('JobApplicationController@nextStep: No step change needed, already at target step.', ['current_step' => $newBackendStep]);
        }


        return response()->json([
            'message' => 'Moved to next step.',
            'current_step' => $newBackendStep, // Return the new backend step
        ]);
    }

    /**
     * Navigate to the previous step of the application.
     *
     * @param Request $request
     * @param JobApplication $jobApplication
     * @return \Illuminate\Http\JsonResponse
     */
    public function backStep(Request $request, JobApplication $jobApplication)
    {
        if ($jobApplication->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        Log::info('JobApplicationController@backStep: Attempting to move step back.', [
            'route_param_jobApplication_id' => $request->route('jobApplication'),
            'resolved_jobApplication_id' => $jobApplication->id ?? 'NOT RESOLVED',
            'resolved_jobApplication_user_id' => $jobApplication->user_id ?? 'N/A',
            'authenticated_user_id' => Auth::id(),
            'current_backend_step' => $jobApplication->current_step,
            'requested_frontend_step' => $request->input('requested_step_number'), // NEW: Log frontend's requested step
        ]);

        // NEW LOGIC: Determine the previous step purely sequentially based on frontend's request
        $currentFrontendStepNumber = $request->input('requested_step_number'); // Frontend sends this
        $newBackendStep = 'personal_details'; // Default for step 1

        switch ($currentFrontendStepNumber) {
            case 2: // From Experience, go back to Personal Details
                $newBackendStep = 'personal_details';
                break;
            case 3: // From Education & Certs, go back to Experience
                $newBackendStep = 'experience_details';
                break;
            case 4: // From Review & Submit, go back to Education & Certs
                $newBackendStep = 'education_certificates';
                break;
            default:
                $newBackendStep = $jobApplication->current_step; // Stay on current if unknown
                Log::warning('JobApplicationController@backStep: Unknown frontend step number received.', [
                    'requested_step_number' => $currentFrontendStepNumber
                ]);
                break;
        }

        if ($jobApplication->current_step !== $newBackendStep) {
            $jobApplication->update(['current_step' => $newBackendStep]);
            Log::info('JobApplicationController@backStep: Successfully moved to previous step.', ['new_step' => $newBackendStep]);
        } else {
             Log::info('JobApplicationController@backStep: No step change needed, already at target step.', ['current_step' => $newBackendStep]);
        }

        return response()->json([
            'message' => 'Moved to previous step.',
            'current_step' => $newBackendStep,
        ]);
    }

    /**
     * Get all job applications for the authenticated user, excluding drafts.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserApplications(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $applications = JobApplication::where('user_id', $user->id)
                                    ->where('status', '!=', 'draft')
                                    ->with('job')
                                    ->orderBy('created_at', 'desc')
                                    ->get();

        $formattedApplications = $applications->map(function ($application) {
            $job = $application->job;

            $displayStatus = 'Applied';
            switch ($application->status) {
                case 'submitted':
                    $displayStatus = 'Applied';
                    break;
                case 'shortlisted':
                    $displayStatus = 'Shortlisted';
                    break;
                case 'interview':
                    $displayStatus = 'Interview';
                    break;
                case 'selected':
                    $displayStatus = 'Selected';
                    break;
                case 'hired':
                    $displayStatus = 'Hired'; // Corrected capitalization
                    break;
                case 'rejected':
                    $displayStatus = 'Rejected';
                    break;
                default:
                    $displayStatus = ucfirst(str_replace('_', ' ', $application->status));
                    break;
            }

            return [
                'id' => $application->id,
                'job_id' => $job->id,
                'companyLogo' => $job->company_logo ?? 'https://placehold.co/50x50/cccccc/000?text=No+Logo',
                'jobTitle' => $job->title,
                'companyName' => $job->company,
                'location' => $job->location,
                'salary' => $job->salary . ($job->salary_type ? ' ' . $job->salary_type : ''),
                'status' => $displayStatus,
                'backend_status' => $application->status,
                'description' => $job->description,
                'isStarred' => false,
                'applied_at' => $application->created_at->toDateTimeString(),
            ];
        });

        Log::info('JobApplicationController@getUserApplications: Fetched user applications (excluding drafts).', [
            'user_id' => $user->id,
            'count' => $formattedApplications->count(),
        ]);

        return response()->json([
            'message' => 'User applications fetched successfully.',
            'applications' => $formattedApplications,
        ]);
    }
    /**
     * Get all job applications for jobs posted by the authenticated employer.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEmployerApplicants(Request $request)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'employer') {
            return response()->json(['error' => 'Unauthorized. Only employers can view applicants.'], 403);
        }

        // Get all job IDs posted by this employer
        $employerJobIds = $user->jobs()->pluck('id');

        if ($employerJobIds->isEmpty()) {
            return response()->json([
                'message' => 'No jobs posted by you, so no applicants yet.',
                'applicants' => []
            ]);
        }

        // Start building the query
        $applicationsQuery = JobApplication::whereIn('job_id', $employerJobIds)
                                    ->with(['job', 'user.profile']);

        // --- Apply Filters ---
        if ($request->has('job_id') && $request->input('job_id')) {
            $applicationsQuery->where('job_id', $request->input('job_id'));
        }

        if ($request->has('status') && $request->input('status')) {
            $applicationsQuery->where('status', $request->input('status'));
        }

        if ($request->has('date_range') && $request->input('date_range')) {
            $dateRange = $request->input('date_range');
            $today = Carbon::today();

            switch ($dateRange) {
                case 'today':
                    $applicationsQuery->whereDate('created_at', $today);
                    break;
                case 'last_7_days':
                    $applicationsQuery->where('created_at', '>=', $today->subDays(6)->startOfDay());
                    break;
                case 'last_30_days':
                    $applicationsQuery->where('created_at', '>=', $today->subDays(29)->startOfDay());
                    break;
                case 'this_month':
                    $applicationsQuery->whereMonth('created_at', $today->month)
                                      ->whereYear('created_at', $today->year);
                    break;
                case 'this_year':
                    $applicationsQuery->whereYear('created_at', $today->year);
                    break;
                // Add more cases for custom date ranges if needed
            }
        }
        // --- End Apply Filters ---

        $applications = $applicationsQuery->orderBy('created_at', 'desc')->get();

        $formattedApplicants = $applications->map(function ($application) {
            $applicant = $application->user;
            $job = $application->job;
            $profile = $applicant->profile;

            $displayStatus = ucfirst(str_replace('_', ' ', $application->status));

            $documentsProvided = []; // Placeholder

            return [
                'id' => $application->id,
                'applicant_id' => $applicant->id,
                'applicantName' => $profile->full_name ?? $applicant->name,
                'applicantEmail' => $applicant->email,
                'jobTitle' => $job->title, // Ensure job is loaded for this
                'companyName' => $job->company, // Ensure job is loaded for this
                'appliedAt' => $application->created_at->diffForHumans(),
                'appliedAtRaw' => $application->created_at->toDateTimeString(),
                'status' => $displayStatus,
                'backend_status' => $application->status,
                'job_id' => $job->id,
                'job_description' => $job->description,
                'applicant_profile_summary' => $profile->about_me ?? 'No summary provided.',
                'documents_provided' => $documentsProvided,
            ];
        });

        Log::info('JobApplicationController@getEmployerApplicants: Fetched applicants for employer with filters.', [
            'employer_id' => $user->id,
            'filters' => $request->query(),
            'count' => $formattedApplicants->count(),
        ]);

        return response()->json([
            'message' => 'Applicants fetched successfully.',
            'applicants' => $formattedApplicants,
        ]);
    }

    /**
     * Show details of a specific job application for an employer.
     *
     * @param JobApplication $jobApplication
     * @return \Illuminate\Http\JsonResponse
     */
    public function showApplicantDetails(JobApplication $jobApplication)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'employer') {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

       $jobApplication->load([
            'job',
            'user.profile', // Still need user and their profile
            'experiences',  // Load experiences directly from JobApplication
            'education',    // Load education directly from JobApplication
            'certifications' // Load certifications directly from JobApplication
        ]);

        if (!$jobApplication->job) {
            Log::warning('Job not found for application (after load).', [
                'application_id' => $jobApplication->id,
                'job_id_on_application' => $jobApplication->job_id,
                'employer_id' => $user->id,
            ]);
            return response()->json(['error' => 'The job associated with this application could not be found.'], 404);
        }

        if ($jobApplication->job->employer_id !== $user->id) {
            Log::warning('Unauthorized attempt to view applicant details.', [
                'user_id' => $user->id,
                'application_id' => $jobApplication->id,
                'job_owner_id' => $jobApplication->job->employer_id
            ]);
            return response()->json(['error' => 'Forbidden: You do not own this job application.'], 403);
        }

        $applicant = $jobApplication->user;
        $job = $jobApplication->job;
        $profile = $applicant->profile;

        $applicantDocuments = [];
        if ($profile && $profile->resume_path) {
            $applicantDocuments[] = [
                'name' => 'Resume',
                'type' => 'resume',
                'url' => Storage::url($profile->resume_path),
                'downloadable' => true,
            ];
        }
        if ($profile && $profile->cover_letter_path) {
            $applicantDocuments[] = [
                'name' => 'Cover Letter',
                'type' => 'cover_letter',
                'url' => Storage::url($profile->cover_letter_path),
                'downloadable' => true,
            ];
        }

        return response()->json([
            'message' => 'Applicant details fetched successfully.',
            'applicant_details' => [
                'application_id' => $jobApplication->id,
                'applicant_id' => $applicant->id,
                'applicantName' => $profile->full_name ?? $applicant->name,
                'applicantEmail' => $applicant->email,
                'applicantPhone' => $profile->phone_number ?? 'N/A',
                'applicantLocation' => $profile->address ?? 'N/A',
                'applicantAboutMe' => $profile->about_me ?? 'No "About Me" section provided.',
                'jobTitle' => $job->title,
                'companyName' => $job->company,
                'jobLocation' => $job->location,
                'jobSalary' => $job->salary . ' ' . $job->salary_type,
                'jobDescription' => $job->description,
                'appliedAt' => $jobApplication->created_at->toDateTimeString(),
                'applicationStatus' => ucfirst(str_replace('_', ' ', $jobApplication->status)),
                'backendStatus' => $jobApplication->status,
                'documents_provided' => $applicantDocuments,
                // --- CRITICAL CHANGE HERE: Access relationships directly from $jobApplication ---
                'experience_summary' => $jobApplication->experiences->map(function($exp) {
                    return "{$exp->job_title} at {$exp->company} ({$exp->start_date} - {$exp->end_date})"; // Note: used $exp->company based on your migration
                })->implode("\n") ?? 'No work experience provided.',
                'education_summary' => $jobApplication->education->map(function($edu) {
                    return "{$edu->degree} from {$edu->institution} ({$edu->start_date} - {$edu->end_date})";
                })->implode("\n") ?? 'No education provided.',
                'certifications_summary' => $jobApplication->certifications->map(function($cert) {
                    return "{$cert->title} ({$cert->provider})"; // Note: used $cert->title and $cert->provider based on your migration
                })->implode("\n") ?? 'No certifications provided.',
                // --- END CRITICAL CHANGE ---
            ]
        ]);
    }

    /**
     * Update the status of a job application.
     *
     * @param Request $request
     * @param JobApplication $jobApplication
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateApplicationStatus(Request $request, JobApplication $jobApplication)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'employer') {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        if (!$jobApplication->job) { // Defensive check
            return response()->json(['error' => 'Associated job not found for this application.'], 404);
        }

        if ($jobApplication->job->employer_id !== $user->id) {
            Log::warning('Unauthorized attempt to update application status.', [
                'user_id' => $user->id,
                'application_id' => $jobApplication->id,
                'job_owner_id' => $jobApplication->job->employer_id
            ]);
            return response()->json(['error' => 'Forbidden: You do not own this job application.'], 403);
        }

        try {
            $validated = $request->validate([
                'status' => 'required|string|in:shortlisted,rejected,interview,selected,hired',
            ]);
            
            $newStatus = $validated['status']; // Get the new status
            $currentStatus = $jobApplication->status; // Get the current status

            $allowedTransitions = [
                'submitted' => ['shortlisted', 'rejected'],
                'shortlisted' => ['interview', 'rejected'],
                'interview' => ['selected', 'rejected'],
                'selected' => ['hired', 'rejected'],
                'rejected' => [], // Terminal state
                'hired' => [], // Terminal state
            ];

            // Check if the transition is allowed
            if (!isset($allowedTransitions[$currentStatus]) || !in_array($newStatus, $allowedTransitions[$currentStatus])) {
                // Special case: Allow 'rejected' from any non-final state if not already rejected/hired
                if ($newStatus === 'rejected' && !in_array($currentStatus, ['rejected', 'hired'])) {
                    // This is allowed
                } else {
                    Log::warning('Invalid application status transition attempted.', [
                        'application_id' => $jobApplication->id,
                        'current_status' => $currentStatus,
                        'new_status' => $newStatus,
                        'employer_id' => $user->id,
                    ]);
                    return response()->json([
                        'error' => "Invalid status transition from '{$currentStatus}' to '{$newStatus}'.",
                        'current_status' => $currentStatus,
                    ], 400);
                }
            }

            $jobApplication->status = $newStatus;
            $jobApplication->save();

            Log::info('Job application status updated.', [
                'application_id' => $jobApplication->id,
                'old_status' => $currentStatus,
                'new_status' => $newStatus,
                'employer_id' => $user->id,
            ]);

            return response()->json([
                'message' => 'Application status updated successfully.',
                'new_status' => $newStatus,
            ]);
        } catch (ValidationException $e) {
            Log::error('Validation error updating application status: ' . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error updating application status: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'An unexpected error occurred while updating application status.'], 500);
        }
    }

    /**
     * Request additional documents from an applicant.
     *
     * @param Request $request
     * @param JobApplication $jobApplication
     * @return \Illuminate\Http\JsonResponse
     */
    public function requestAdditionalDocuments(Request $request, JobApplication $jobApplication)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'employer') {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        if (!$jobApplication->job) { // Defensive check
            return response()->json(['error' => 'Associated job not found for this application.'], 404);
        }

        if ($jobApplication->job->employer_id !== $user->id) {
            Log::warning('Unauthorized attempt to request documents.', [
                'user_id' => $user->id,
                'application_id' => $jobApplication->id,
                'job_owner_id' => $jobApplication->job->employer_id
            ]);
            return response()->json(['error' => 'Forbidden: You do not own this job application.'], 403);
        }

        try {
            $validated = $request->validate([
                'message' => 'required|string|max:1000',
                'document_types' => 'nullable|array',
                'document_types.*' => 'string|max:255',
            ]);

            Log::info('Employer requested additional documents.', [
                'application_id' => $jobApplication->id,
                'employer_id' => $user->id,
                'message' => $validated['message'],
                'document_types' => $validated['document_types'] ?? [],
            ]);

            return response()->json([
                'message' => 'Request for additional documents sent successfully.',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error requesting additional documents: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'An unexpected error occurred.'], 500);
        }
    }

    /**
     * Get counts of applications by status for the authenticated employer's jobs.
     * Includes total applicants, shortlisted, and rejected.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getApplicantCounts(Request $request)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'employer') {
            return response()->json(['error' => 'Unauthorized. Only employers can view applicant counts.'], 403);
        }

        $employerJobIds = $user->jobs()->pluck('id');

        if ($employerJobIds->isEmpty()) {
            return response()->json([
                'message' => 'No jobs posted by you.',
                'counts' => [
                    'total_applicants' => 0,
                    'shortlisted' => 0,
                    'rejected' => 0,
                    'hired' => 0, 
                ]
            ]);
        }

        // Count applications for jobs owned by this employer
        $totalApplicants = JobApplication::whereIn('job_id', $employerJobIds)
                                         ->where('status', 'submitted') // Only count submitted applications as 'applicants'
                                         ->count();

        $shortlistedApplicants = JobApplication::whereIn('job_id', $employerJobIds)
                                               ->where('status', 'shortlisted')
                                               ->count();

        $rejectedApplicants = JobApplication::whereIn('job_id', $employerJobIds)
                                            ->where('status', 'rejected')
                                            ->count();

        // Fetch the count for 'hired' status
        $hiredApplicants = JobApplication::whereIn('job_id', $employerJobIds)
                                         ->where('status', 'hired')
                                         ->count();

        Log::info('JobApplicationController@getApplicantCounts: Fetched applicant counts.', [
            'employer_id' => $user->id,
            'counts' => [
                'total_applicants' => $totalApplicants,
                'shortlisted' => $shortlistedApplicants,
                'rejected' => $rejectedApplicants,
                'hired' => $hiredApplicants,
            ],
        ]);

        return response()->json([
            'message' => 'Applicant counts fetched successfully.',
            'counts' => [
                'total_applicants' => $totalApplicants,
                'shortlisted' => $shortlistedApplicants,
                'rejected' => $rejectedApplicants,
                'hired' => $hiredApplicants,
            ]
        ]);
    }

    /**
     * Get all job applications for a specific job posted by the authenticated employer.
     *
     * @param Job $job The job model instance (Route Model Binding)
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getApplicantsForJob(Job $job, Request $request)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'employer') {
            Log::warning('Unauthorized attempt to view applicants for job: Not an employer.', [
                'user_id' => $user->id ?? 'N/A',
                'job_id' => $job->id,
            ]);
            return response()->json(['error' => 'Unauthorized. Only employers can view applicants for their jobs.'], 403);
        }

        // --- ADD THESE LOGGING LINES ---
        Log::info('Checking job ownership for getApplicantsForJob.', [
            'logged_in_user_id' => $user->id,
            'job_id_from_route' => $job->id,
            'job_employer_id_from_model' => $job->employer_id,
            'comparison_result' => ($job->employer_id === $user->id) // This will be true/false
        ]);
        // --- END ADDITION ---

        // Ensure the employer owns this job
        if ($job->employer_id !== $user->id) {
            Log::warning('Unauthorized attempt to view applicants for a job not owned by employer.', [
                'user_id' => $user->id,
                'job_id' => $job->id,
                'job_owner_id' => $job->employer_id
            ]);
            return response()->json(['error' => 'Forbidden: You do not own this job.'], 403);
        }

        // Fetch applications for this specific job, eager load applicant (user) and their profile
        $applications = JobApplication::where('job_id', $job->id)
                                    ->with(['user.profile']) // Eager load applicant's profile
                                    ->orderBy('created_at', 'desc') // Latest applications first
                                    ->get();

        $formattedApplicants = $applications->map(function ($application) {
            $applicant = $application->user;
            $profile = $applicant->profile;

            $displayStatus = ucfirst(str_replace('_', ' ', $application->status));

            return [
                'id' => $application->id, // This is the job_application_id
                'applicant_id' => $applicant->id, // This is the user_id
                'applicantName' => $profile->full_name ?? $applicant->name, // Prefer profile name
                'applicantEmail' => $applicant->email,
                'appliedAt' => $application->created_at->diffForHumans(), // e.g., "3 days ago"
                'appliedAtRaw' => $application->created_at->toDateTimeString(),
                'status' => $displayStatus, // e.g., 'Applied', 'Shortlisted', 'Rejected'
                'backend_status' => $application->status, // Original backend status
                // No need for jobTitle or companyName here as it's implicit for this page
            ];
        });

        Log::info('JobApplicationController@getApplicantsForJob: Fetched applicants for specific job.', [
            'employer_id' => $user->id,
            'job_id' => $job->id,
            'count' => $formattedApplicants->count(),
        ]);

        return response()->json([
            'message' => 'Applicants for job fetched successfully.',
            'job_title' => $job->title, // Return job title for the frontend header
            'applicants' => $formattedApplicants,
        ]);
    }

    /**
     * Get latest activities for the authenticated employer.
     * This is a placeholder and should be replaced with real data from an activity log.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLatestActivities(Request $request)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'employer') {
            return response()->json(['error' => 'Unauthorized. Only employers can view activities.'], 403);
        }

        // --- Placeholder Data ---
        // In a real application, you would query your database for activities
        // related to the employer's jobs, comments on their posts, etc.
        // You would also apply filtering logic based on $request->query()
        $activities = [
            [
                'id' => 1,
                'type' => 'new_application',
                'title' => 'New Application for Frontend Developer',
                'description' => 'John Doe applied for Frontend Developer position.',
                'time' => '5 minutes ago',
            ],
            [
                'id' => 2,
                'type' => 'document_upload',
                'title' => 'New Document Uploaded',
                'description' => 'Jane Smith uploaded a portfolio for Backend Engineer.',
                'time' => '1 hour ago',
            ],
            [
                'id' => 3,
                'type' => 'comment',
                'title' => 'New Comment on Job Post',
                'description' => 'A user commented on your "Marketing Manager" job.',
                'time' => '3 hours ago',
            ],
            [
                'id' => 4,
                'type' => 'new_application',
                'title' => 'New Application for UI/UX Designer',
                'description' => 'Alice Johnson applied for UI/UX Designer position.',
                'time' => '1 day ago',
            ],
            [
                'id' => 5,
                'type' => 'profile_view',
                'title' => 'Your Employer Profile was Viewed',
                'description' => 'A job seeker viewed your company profile.',
                'time' => '2 days ago',
            ],
        ];

        // --- Apply basic filtering for demonstration ---
        $filteredActivities = collect($activities)->filter(function ($activity) use ($request) {
            $match = true;

            if ($request->has('activity_type') && $request->input('activity_type')) {
                $match = $match && ($activity['type'] === $request->input('activity_type'));
            }
            // Add more filter logic here (e.g., by job_id, date range)

            return $match;
        })->values()->all(); // Reset keys after filtering

        Log::info('JobApplicationController@getLatestActivities: Fetched latest activities.', [
            'employer_id' => $user->id,
            'filters' => $request->query(),
            'count' => count($filteredActivities),
        ]);

        return response()->json([
            'message' => 'Latest activities fetched successfully.',
            'activities' => $filteredActivities,
        ]);
    }

    /**
     * Schedule an interview for a specific job application and update its status.
     *
     * @param Request $request
     * @param JobApplication $jobApplication
     * @return \Illuminate\Http\JsonResponse
     */
    public function scheduleInterview(Request $request, JobApplication $jobApplication)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'employer') {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        // Ensure the employer owns the job related to this application
        if (!$jobApplication->job || $jobApplication->job->employer_id !== $user->id) {
            Log::warning('Unauthorized attempt to schedule interview for job not owned by employer.', [
                'user_id' => $user->id,
                'application_id' => $jobApplication->id,
                'job_owner_id' => $jobApplication->job->employer_id ?? 'N/A'
            ]);
            return response()->json(['error' => 'Forbidden: You do not own this job application.'], 403);
        }

        // Ensure applicant is shortlisted before scheduling interview
        if ($jobApplication->status !== 'shortlisted') {
            Log::warning('Attempt to schedule interview for non-shortlisted applicant.', [
                'application_id' => $jobApplication->id,
                'current_status' => $jobApplication->status,
                'employer_id' => $user->id,
            ]);
            return response()->json(['error' => 'Applicant must be shortlisted to schedule an interview.'], 400);
        }

        try {
            $validated = $request->validate([
                'interview_link' => 'required|string|max:2048', // URL or location/phone number
                'message' => 'required|string|max:2000',
                'interview_date' => 'required|date_format:Y-m-d|after_or_equal:today',
                'interview_time' => 'required|date_format:H:i',
                'interview_type' => 'required|string|in:online,in-person,phone',
                'interviewers' => 'nullable|array', // Array of strings
                'interviewers.*' => 'string|max:255',
            ]);

            // Save interview details to the job_applications table
            $jobApplication->interview_date = $validated['interview_date'];
            $jobApplication->interview_time = $validated['interview_time'];
            $jobApplication->interview_link = $validated['interview_link'];
            $jobApplication->interview_type = $validated['interview_type'];
            $jobApplication->interviewers = json_encode($validated['interviewers'] ?? []); // Store as JSON
            $jobApplication->interview_message = $validated['message'];

            // Update application status to 'interview'
            $jobApplication->status = 'interview';
            $jobApplication->save();

            Log::info('Interview scheduled for applicant and details saved.', [
                'application_id' => $jobApplication->id,
                'employer_id' => $user->id,
                'interview_details' => $validated,
                'new_status' => 'interview',
            ]);

            return response()->json([
                'message' => 'Interview scheduled successfully. Applicant status updated to Interview.',
                'application_id' => $jobApplication->id,
                'new_status' => 'interview',
            ]);

        } catch (ValidationException $e) {
            Log::error('Validation error scheduling interview: ' . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error scheduling interview: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'An unexpected error occurred while scheduling interview.'], 500);
        }
    }

    /**
     * Get scheduled interviews for the authenticated employer.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getScheduledInterviews(Request $request)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'employer') {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        $employerJobIds = $user->jobs()->pluck('id');

        if ($employerJobIds->isEmpty()) {
            return response()->json([
                'message' => 'No jobs posted by you, so no scheduled interviews.',
                'interviews' => []
            ]);
        }

        // Fetch applications with 'interview' status for the employer's jobs
        // and where interview_date is today or in the future
        $interviews = JobApplication::whereIn('job_id', $employerJobIds)
                                    ->where('status', 'interview')
                                    ->where(function ($query) {
                                        $query->whereDate('interview_date', '>=', Carbon::today());
                                    })
                                    ->with(['user.profile', 'job']) // Eager load user profile and job details
                                    ->orderBy('interview_date')
                                    ->orderBy('interview_time')
                                    ->get();

        $formattedInterviews = $interviews->map(function ($application) {
            $applicantName = $application->user->profile->full_name ?? $application->user->name;
            $jobTitle = $application->job->title;
            $interviewDate = Carbon::parse($application->interview_date);
            $interviewTime = Carbon::parse($application->interview_time);

            return [
                'id' => $application->id,
                'applicant_id' => $application->user->id,
                'applicantName' => $applicantName,
                'jobTitle' => $jobTitle,
                'interviewDate' => $interviewDate->toDateString(), // YYYY-MM-DD
                'interviewTime' => $interviewTime->toTimeString('minute'), // HH:MM:SS (or 'H:i' for HH:MM)
                'interviewType' => $application->interview_type,
                'interviewLink' => $application->interview_link,
                'interviewMessage' => $application->interview_message,
                'interviewers' => json_decode($application->interviewers, true) ?? [], // Decode JSON
            ];
        });

        Log::info('JobApplicationController@getScheduledInterviews: Fetched scheduled interviews for employer.', [
            'employer_id' => $user->id,
            'count' => $formattedInterviews->count(),
        ]);

        return response()->json([
            'message' => 'Scheduled interviews fetched successfully.',
            'interviews' => $formattedInterviews,
        ]);
    }
}
