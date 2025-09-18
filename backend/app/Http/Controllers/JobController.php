<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Job;
use App\Models\Profile;
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
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->isEmployer()) {
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
                'logo' => 'nullable|image|max:2048',
                'image' => 'nullable|image|max:2048',
                'apply_before' => 'required|date',
                'video_url' => 'nullable|url',
                'key_points' => 'nullable|array',
                'package_id' => 'required|exists:subscription_plans,id',
            ]);

            $jobLogo = $request->hasFile('logo') ? $request->file('logo')->store('job-logos', 'public') : null;
            $jobBanner = $request->hasFile('image') ? $request->file('image')->store('job-banners', 'public') : null;

            $job = Job::create([
                'employer_id'   => $user->id,
                'title'         => $validated['title'],
                'description'   => $validated['description'],
                'location'      => $validated['location'],
                'classification'=> $validated['classification'],
                'work_type'     => $validated['work_type'],
                'workplace'     => $validated['workplace'],
                'salary'        => $validated['salary'],
                'salary_type'   => $validated['salary_type'],
                'company'       => $validated['company'],
                'logo_path'     => $jobLogo,
                'image'         => $jobBanner,
                'apply_before'  => $validated['apply_before'],
                'video_url'     => $validated['video_url'] ?? null,
                'key_points'    => $validated['key_points'] ?? null,
                'package_id'    => $validated['package_id'],
                'is_published'  => false,
            ]);

            return response()->json([
                'message' => 'Draft job created successfully.',
                'job_id' => $job->id,
                'package_id' => $validated['package_id'],
            ], 201);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error creating job:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json(['error' => 'Unexpected error occurred while creating the job.'], 500);
        }
    }


    /**
     * Display a listing of jobs (public view).
     */
    public function index(Request $request)
    {
        $query = Job::query()
            ->where('is_published', true)
            ->whereHas('transactions', function ($q) {
                $q->where('status', 'succeeded');
            });

        if ($request->filled('title')) {
            $keyword = $request->input('title');
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', '%' . $keyword . '%')
                  ->orWhere('description', 'like', '%' . $keyword . '%')
                  ->orWhere('company', 'like', '%' . $keyword . '%');
            });
        }

        if ($request->filled('location')) {
            $location = $request->input('location');
            $query->where('location', 'like', '%' . $location . '%');
        }

        if ($request->filled('classification')) {
            $query->where('classification', $request->input('classification'));
        }

        $jobs = $query->with(['employer.profile', 'transactions'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($job) => $this->processJobForFrontend($job));

        return response()->json($jobs);
    }

    /**
     * Display a specific job.
     */
    public function show(Job $job, Request $request)
    {
        $job->load('employer.profile');

        try {
            return response()->json($this->processJobForFrontend($job));
        } catch (\Throwable $th) {
            Log::error('Error processing job for frontend in show method:', [
                'job_id' => $job->id ?? 'N/A',
                'error_message' => $th->getMessage(),
                'file' => $th->getFile(),
                'line' => $th->getLine(),
            ]);
            return response()->json(['error' => 'Failed to process job details.'], 500);
        }
    }

    /**
     * Process job data for consistent frontend output.
     */
    private function processJobForFrontend($job)
    {
        $appUrl = Config::get('app.url');
        $employer = $job->employer;
        $profile  = $employer ? $employer->profile : null;

        $companyLogo = $job->logo_path
            ? Storage::url($job->logo_path)
            : ($profile?->logo_url
                ? Storage::url($profile->logo_url)
                : $appUrl . '/images/default-company-logo.png');

        $bannerImage = $job->image
            ? Storage::url($job->image)
            : ($profile?->banner_url
                ? Storage::url($profile->banner_url)
                : $appUrl . '/images/default-job-banner.png');

        $applyBeforeDate = $job->apply_before ? new \DateTime($job->apply_before) : null;
        $now = new \DateTime();
        $remainingdate = 'N/A';
        if ($applyBeforeDate) {
            $diff = $now->diff($applyBeforeDate);
            if ($diff->invert) {
                $remainingdate = 'Expired';
            } elseif ($diff->days === 0) {
                $remainingdate = 'Today';
            } else {
                $remainingdate = $diff->days . ' days left';
            }
        }

        $postedDate = $job->created_at ? new \DateTime($job->created_at) : null;
        $posted = 'N/A';
        if ($postedDate) {
            $postedDiff = $now->diff($postedDate);
            if ($postedDiff->days === 0) {
                $posted = 'today';
            } elseif ($postedDiff->days === 1) {
                $posted = '1 day ago';
            } else {
                $posted = $postedDiff->days . ' days ago';
            }
        }

        $keyPoints = $job->key_points;
        if (is_string($keyPoints)) {
            $keyPoints = json_decode($keyPoints, true);
        }
        $keyPoints = is_array($keyPoints) ? array_filter($keyPoints) : [];

        return [
            'id'            => $job->id,
            'title'         => $job->title,
            'description'   => $job->description,
            'location'      => $job->location,
            'classification'=> $job->classification,
            'work_type'     => $job->work_type,
            'workplace'     => $job->workplace,
            'salary'        => $job->salary,
            'salary_type'   => $job->salary_type,
            'company'       => $job->company,
            'logo'          => $companyLogo,
            'image'         => $bannerImage,
            'apply_before_raw' => $job->apply_before,
            'video_url'     => $job->video_url,
            'key_points'    => $keyPoints,
            'is_published'  => $job->is_published,
            'created_at_raw'=> $job->created_at,
            'remainingdate' => $remainingdate,
            'posted'        => $posted,
            'employer_id'   => $job->employer_id,
            'package_id'    => $job->package_id, // include package_id for frontend
        ];
    }


    /**
     * Get jobs posted by the authenticated employer.
     */
    public function getEmployerJobs(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'employer') {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        $jobs = Job::where('employer_id', $user->id)
            ->latest()
            ->with('employer.profile')
            ->get()
            ->map(fn($job) => $this->processJobForFrontend($job));

        return response()->json([
            'message' => 'Employer jobs fetched successfully.',
            'jobs'    => $jobs
        ]);
    }

    /**
     * Update the specified job.
     */
    public function update(Request $request, Job $job)
    {
        $user = Auth::user();

        if (!$user || $user->id !== $job->employer_id) {
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
                'logo' => 'nullable|image|max:2048',
                'image' => 'nullable|image|max:2048',
                'apply_before' => 'required|date',
                'video_url' => 'nullable|url',
                'key_points' => 'nullable|array',
                'is_published' => 'boolean',
            ]);

            if ($request->hasFile('logo')) {
                if ($job->logo_path) {
                    Storage::disk('public')->delete($job->logo_path);
                }
                $validatedData['logo_path'] = $request->file('logo')->store('job-logos', 'public');
                unset($validatedData['logo']);
            } else {
                unset($validatedData['logo']);
            }

            if ($request->hasFile('image')) {
                if ($job->image) {
                    Storage::disk('public')->delete($job->image);
                }
                $validatedData['image'] = $request->file('image')->store('job-banners', 'public');
            } else {
                unset($validatedData['image']);
            }

            $job->update($validatedData);

            return response()->json([
                'message' => 'Job updated successfully.',
                'job'     => $job
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred while updating the job.'], 500);
        }
    }

    /**
     * Remove the specified job.
     */
    public function destroy(Job $job)
    {
        $user = Auth::user();

        if (!$user || $user->id !== $job->employer_id) {
            return response()->json(['error' => 'Unauthorized to delete this job.'], 403);
        }

        try {
            if ($job->logo_path) {
                Storage::disk('public')->delete($job->logo_path);
            }
            if ($job->image) {
                Storage::disk('public')->delete($job->image);
            }

            $job->delete();
            return response()->json(['message' => 'Job deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred while deleting the job.'], 500);
        }
    }
}
