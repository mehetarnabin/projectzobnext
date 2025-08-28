<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Job;
use App\Models\Profile; // Assuming Profile model exists for employer profiles
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class JobController extends Controller
{
    /**
     * Store a newly created job in storage.
     * Employer who is logged in will be the owner.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Your provided store method is good. Using it as is.
        if (!Auth::user()->isEmployer()) {
            return response()->json(['error' => 'Unauthorized: Only employers can post jobs.'], 403);
        }

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'location' => 'required|string|max:255',
                'classification' => 'required|string|max:255',
                'work_type' => 'required|string|in:Full Time,Part Time,Contract,Internship',
                'workplace' => 'required|string|in:On-site,Hybrid,Remote',
                'salary' => 'required|string|max:255',
                'salary_type' => 'required|string|in:Annual,Hourly,Contract',
                'company' => 'required|string|max:255',
                'logo' => 'nullable|image|max:2048', // This is the uploaded file
                'image' => 'nullable|image|max:2048', // This is the uploaded banner file
                'apply_before' => 'required|date',
                'video_url' => 'nullable|url',
                'key_points' => 'nullable|array',
                'package' => 'required|string',
            ]);

            $jobLogoPath = null;
            if ($request->hasFile('logo')) {
                $jobLogoPath = $request->file('logo')->store('job-logos', 'public');
            }

            $jobImagePath = null; // For the job-specific banner image
            if ($request->hasFile('image')) {
                $jobImagePath = $request->file('image')->store('job-banners', 'public');
            }

            $job = Job::create([
                'employer_id' => Auth::id(),
                'title' => $validated['title'],
                'description' => $validated['description'],
                'location' => $validated['location'],
                'classification' => $validated['classification'],
                'work_type' => $validated['work_type'],
                'workplace' => $validated['workplace'],
                'salary' => $validated['salary'],
                'salary_type' => $validated['salary_type'],
                'company' => $validated['company'],
                'logo_path' => $jobLogoPath, // Storing job-specific logo path
                'image' => $jobImagePath, // Storing job-specific banner path
                'apply_before' => $validated['apply_before'],
                'video_url' => $validated['video_url'] ?? null,
                'key_points' => $validated['key_points'] ?? null,
                'package' => $validated['package'],
                'is_published' => true, // Assuming new jobs are published by default
            ]);

            Log::info('Job posted successfully by employer.', ['job_id' => $job->id, 'employer_id' => Auth::id()]);

            return response()->json([
                'message' => 'Job posted successfully',
                'job' => $job
            ], 201);
        } catch (ValidationException $e) {
            Log::error('Job posting validation failed:', ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error posting job: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'An unexpected error occurred while posting the job.'], 500);
        }
    }

    /**
     * Display a listing of jobs (public view).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Job::where('is_published', true);

        // Filter by title/keywords/company
        if ($request->has('title')) {
            $keyword = $request->input('title');
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', '%' . $keyword . '%')
                  ->orWhere('description', 'like', '%' . $keyword . '%')
                  ->orWhere('company', 'like', '%' . $keyword . '%');
            });
        }

        // Filter by location
        if ($request->has('location')) {
            $location = $request->input('location');
            $query->where('location', 'like', '%' . $location . '%');
        }

        // Filter by classification
        if ($request->has('classification')) {
            $classification = $request->input('classification');
            $query->where('classification', $classification);
        }

        $jobs = $query->with('employer.profile') // Eager load employer and their profile
                      ->orderBy('created_at', 'desc')
                      ->get()
                      ->map(function ($job) {
                           return $this->processJobForFrontend($job);
                       });

        return response()->json($jobs);
    }

    /**
     * Display the specified job.
     *
     * @param  \App\Models\Job  $job
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Job $job, Request $request)
    {
        // Your provided show method is good. Using it as is.
        $job->load('employer.profile'); // Ensure employer and profile are loaded

        try {
            $processedJob = $this->processJobForFrontend($job);
            return response()->json($processedJob);
        } catch (\Throwable $th) {
            Log::error('Error processing job for frontend in show method:', [
                'job_id' => $job->id ?? 'N/A',
                'error_message' => $th->getMessage(),
                'file' => $th->getFile(),
                'line' => $th->getLine(),
                'trace' => $th->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to process job details.', 'debug_info' => $th->getMessage()], 500);
        }
    }

    /**
     * Helper function to process job data for consistent frontend output.
     * Adjusted to prioritize job-specific logo/image, then employer profile, then default.
     *
     * @param Job $job
     * @return array
     */
    private function processJobForFrontend($job)
    {
        $appUrl = Config::get('app.url');

        $employer = $job->employer;
        $profile = $employer ? $employer->profile : null;

        // Logic for company logo: job-specific logo > employer profile logo > default
        $companyLogo = $job->logo_path
            ? Storage::url($job->logo_path)
            : ($profile?->logo_url
                ? Storage::url($profile->logo_url)
                : $appUrl . '/images/default-company-logo.png');

        // Logic for banner image: job-specific image > employer profile banner > default
        $bannerImage = $job->image // This is the 'image' field from your Job model
            ? Storage::url($job->image)
            : ($profile?->banner_url
                ? Storage::url($profile->banner_url)
                : $appUrl . '/images/default-job-banner.png');

        // Null-safe access for apply_before
        $applyBeforeDate = $job->apply_before ? new \DateTime($job->apply_before) : null;
        $now = new \DateTime();
        $remainingdate = '';
        if ($applyBeforeDate) {
            $diff = $now->diff($applyBeforeDate);
            if ($diff->invert) {
                $remainingdate = 'Expired';
            } elseif ($diff->days === 0) {
                $remainingdate = 'Today';
            } else {
                $remainingdate = $diff->days . ' days left';
            }
        } else {
            $remainingdate = 'N/A';
        }

        // Null-safe access for created_at
        $postedDate = $job->created_at ? new \DateTime($job->created_at) : null;
        $posted = '';
        if ($postedDate) {
            $postedDiff = $now->diff($postedDate);
            if ($postedDiff->days === 0) {
                $posted = 'today';
            } elseif ($postedDiff->days === 1) {
                $posted = '1 day ago';
            } else {
                $posted = $postedDiff->days . ' days ago';
            }
        } else {
            $posted = 'N/A';
        }

        // Handle key_points - ensure it's an array
        $keyPoints = $job->key_points;
        if (is_string($keyPoints)) {
            $keyPoints = json_decode($keyPoints, true);
        }
        $keyPoints = is_array($keyPoints) ? array_filter($keyPoints) : [];

        return [
            'id' => $job->id,
            'title' => $job->title,
            'description' => $job->description,
            'location' => $job->location,
            'classification' => $job->classification,
            'work_type' => $job->work_type,
            'workplace' => $job->workplace,
            'salary' => $job->salary,
            'salary_type' => $job->salary_type,
            'company' => $job->company,
            'logo' => $companyLogo, // Processed logo URL
            'image' => $bannerImage, // Processed banner image URL
            'apply_before_raw' => $job->apply_before, // Keep raw date if needed
            'video_url' => $job->video_url,
            'key_points' => $keyPoints,
            'package' => $job->package,
            'is_published' => $job->is_published,
            'created_at_raw' => $job->created_at, // Keep raw date if needed
            'remainingdate' => $remainingdate, // Formatted string
            'posted' => $posted, // Formatted string
            'employer_id' => $job->employer_id, // Important for ownership checks
        ];
    }

    /**
     * Get jobs posted by the authenticated employer.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEmployerJobs(Request $request)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'employer') {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        // Fetch jobs posted by this specific employer (employer_id)
        $jobs = Job::where('employer_id', $user->id)
                    ->latest() // Order by latest posted
                    ->with('employer.profile') // Eager load employer and their profile for processJobForFrontend
                    ->get()
                    ->map(function ($job) {
                        return $this->processJobForFrontend($job);
                    });

        return response()->json([
            'message' => 'Employer jobs fetched successfully.',
            'jobs' => $jobs
        ]);
    }

    /**
     * Update the specified job in storage.
     * Only the employer who posted it can update it.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Job  $job
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Job $job)
    {
        $user = Auth::user();

        // Ensure logged-in user is the job owner
        if (!$user || $user->id !== $job->employer_id) { // Use employer_id
            Log::warning('Unauthorized attempt to update job.', [
                'user_id' => $user->id ?? 'guest',
                'job_id' => $job->id,
                'owner_id' => $job->employer_id
            ]);
            return response()->json(['error' => 'Unauthorized to update this job.'], 403);
        }

        try {
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'location' => 'required|string|max:255',
                'classification' => 'required|string|max:255',
                'work_type' => 'required|string|in:Full Time,Part Time,Contract,Internship',
                'workplace' => 'required|string|in:On-site,Hybrid,Remote',
                'salary' => 'required|string|max:255',
                'salary_type' => 'required|string|in:Annual,Hourly,Contract',
                'company' => 'required|string|max:255',
                'logo' => 'nullable|image|max:2048', // For new logo upload
                'image' => 'nullable|image|max:2048', // For new banner upload
                'apply_before' => 'required|date',
                'video_url' => 'nullable|url',
                'key_points' => 'nullable|array',
                'package' => 'required|string',
                'is_published' => 'boolean', // Allow updating publish status
            ]);

            // Handle logo update
            if ($request->hasFile('logo')) {
                // Delete old logo if exists
                if ($job->logo_path) {
                    Storage::disk('public')->delete($job->logo_path);
                }
                $validatedData['logo_path'] = $request->file('logo')->store('job-logos', 'public');
            } else {
                // If no new file, but logo field is present in request (e.g., as null for removal)
                // Or if you want to keep existing logo if 'logo' field is not sent
                unset($validatedData['logo']); // Remove 'logo' from validatedData to prevent mass assignment error
            }

            // Handle image (banner) update
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($job->image) {
                    Storage::disk('public')->delete($job->image);
                }
                $validatedData['image'] = $request->file('image')->store('job-banners', 'public');
            } else {
                unset($validatedData['image']); // Remove 'image' from validatedData
            }

            $job->update($validatedData);

            Log::info('Job updated successfully.', ['job_id' => $job->id, 'user_id' => $user->id]);

            return response()->json([
                'message' => 'Job updated successfully.',
                'job' => $job
            ]);
        } catch (ValidationException $e) {
            Log::error('Job update validation failed:', ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error updating job: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'An unexpected error occurred while updating the job.'], 500);
        }
    }

    /**
     * Remove the specified job from storage.
     * Only the employer who posted it can delete it.
     *
     * @param  \App\Models\Job  $job
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Job $job)
    {
        $user = Auth::user();

        // Ensure logged-in user is the job owner
        if (!$user || $user->id !== $job->employer_id) { // Use employer_id
            Log::warning('Unauthorized attempt to delete job.', [
                'user_id' => $user->id ?? 'guest',
                'job_id' => $job->id,
                'owner_id' => $job->employer_id
            ]);
            return response()->json(['error' => 'Unauthorized to delete this job.'], 403);
        }

        try {
            // Delete associated files before deleting the record
            if ($job->logo_path) {
                Storage::disk('public')->delete($job->logo_path);
            }
            if ($job->image) {
                Storage::disk('public')->delete($job->image);
            }

            $job->delete();
            Log::info('Job deleted successfully.', ['job_id' => $job->id, 'user_id' => $user->id]);
            return response()->json(['message' => 'Job deleted successfully.']);
        } catch (\Exception $e) {
            Log::error('Error deleting job: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'An unexpected error occurred while deleting the job.'], 500);
        }
    }
}