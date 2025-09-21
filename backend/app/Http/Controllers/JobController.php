<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Job;
use App\Models\Profile;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
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
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'location' => 'nullable|string',
                'classification' => 'nullable|string',
                'work_type' => 'nullable|string',
                'workplace' => 'nullable|string',
                'salary' => 'nullable|string',
                'salary_type' => 'nullable|string',
                'company' => 'nullable|string',
                'apply_before' => 'nullable|date',
                'package_id' => 'required|exists:subscription_plans,id',
                'package_price' => 'required|numeric',
                'logo' => 'nullable|image|max:2048',   // ✅ Job/company logo
                'image' => 'nullable|image|max:2048',  // ✅ Job banner image
            ]);

            $packagePrice = $validated['package_price'];
            $isFree = $packagePrice <= 0;


            // ✅ Handle logo upload
            $logoPath = null;
            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('job-logos', 'public');
            }

            // ✅ Handle banner upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('job-banners', 'public');
            }

            // Create job
            $job = Job::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? 'Draft description',
                'location' => $validated['location'] ?? 'TBD',
                'classification' => $validated['classification'] ?? 'General',
                'work_type' => $validated['work_type'] ?? 'Full Time',
                'workplace' => $validated['workplace'] ?? 'Remote',
                'salary' => $validated['salary'] ?? 'TBD',
                'salary_type' => $validated['salary_type'] ?? 'Annual',
                'company' => $validated['company'] ?? 'TBD',
                'apply_before' => $validated['apply_before'] ?? now()->addDays(30)->toDateString(),
                'package_id' => $validated['package_id'],
                'is_published' => $isFree, // Free job auto-published
                'status' => $isFree ? 'published' : 'pending_payment',
                'employer_id' => $user->id,
                'logo_path' => $logoPath,   // ✅ Save logo path
                'image' => $imagePath,      // ✅ Save banner path
            ]);

            // Free package → auto-create transaction
            if ($isFree) {
                Transaction::create([
                    'user_id' => $user->id,
                    'job_id' => $job->id,
                    'package_id' => $validated['package_id'],
                    'amount' => 0,
                    'currency' => 'usd',
                    'status' => 'succeeded',
                    'stripe_payment_id' => null,
                    'job_posted' => true,
                ]);
            }

            return response()->json([
                'message' => $isFree
                    ? 'Free job posted successfully.'
                    : 'Draft job created. Proceed to payment.',
                'job_id' => $job->id,
                'package_id' => $validated['package_id'],
            ], 201);

        } catch (ValidationException $ve) {
            return response()->json(['errors' => $ve->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error creating job: '.$e->getMessage());
            return response()->json(['error' => 'Unexpected error occurred while creating the job.'], 500);
        }
    }


    public function index(Request $request)
    {
        $query = Job::where('is_published', true);

        // Filter by title/keywords/company
        if ($request->filled('title')) {
            $keyword = $request->input('title');
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', '%' . $keyword . '%')
                ->orWhere('description', 'like', '%' . $keyword . '%')
                ->orWhere('company', 'like', '%' . $keyword . '%');
            });
        }

        // Filter by location
        if ($request->filled('location')) {
            $query->where('location', 'like', '%' . $request->input('location') . '%');
        }

        // Filter by classification (multiple allowed: IT, Finance,…)
        if ($request->filled('classification')) {
            $classifications = explode(',', $request->input('classification'));
            $query->whereIn('classification', $classifications);
        }

        // ✅ Filter by work type (Full Time, Part Time, Contract, Internship)
        if ($request->filled('work_type')) {
            $workTypes = explode(',', $request->input('work_type'));
            $query->whereIn('work_type', $workTypes);
        }

        // ✅ Filter by workplace (On-site, Hybrid, Remote)
        if ($request->filled('workplace')) {
            $workplaces = explode(',', $request->input('workplace'));
            $query->whereIn('workplace', $workplaces);
        }

        // ✅ Filter by salary range (example: 5000-10000)
        if ($request->filled('salary')) {
            $salaryRange = explode('-', $request->input('salary'));
            if (count($salaryRange) === 2) {
                $query->whereBetween('salary', [$salaryRange[0], $salaryRange[1]]);
            }
        }

        // ✅ Filter by "listed time" (posted within X days)
        if ($request->filled('listed_time')) {
            $days = (int) $request->input('listed_time');
            $query->where('created_at', '>=', now()->subDays($days));
        }

        $jobs = $query->with('employer.profile')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(fn($job) => $this->processJobForFrontend($job));

        return response()->json($jobs);
    }

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
            'package_id'    => $job->package_id,
        ];
    }

     /**
     * Featured Employers — unified logo logic
     */
   public function featuredEmployers()
{
    try {
        // Get published jobs that have successful paid transactions
        $jobs = Job::where('is_published', true)
            ->whereHas('transactions', function ($q) {
                $q->where('job_posted', true)
                  ->where('amount', '>', 0)
                  ->where('status', 'succeeded');
            })
            ->with('employer.profile')
            ->select('id', 'company', 'logo_path', 'employer_id')
            ->get()
            ->unique('company'); // Remove duplicate companies

        $data = $jobs->map(function ($job) {
            $employer = $job->employer;
            $profile  = $employer ? $employer->profile : null;

            // Absolute logo URL
            if ($job->logo_path) {
                $companyLogo = asset('storage/' . $job->logo_path);
            } elseif ($profile?->logo_url) {
                $companyLogo = asset('storage/' . $profile->logo_url);
            } else {
                $companyLogo = asset('images/default-company-logo.png');
            }

            return [
                'companyName' => $job->company,
                'logoUrl'     => $companyLogo,
            ];
        })->values(); // Reset keys

        return response()->json([
            'message'   => 'Featured employers fetched successfully.',
            'employers' => $data
        ]);
    } catch (\Throwable $e) {
        Log::error('Featured employers fetch error: ' . $e->getMessage());
        return response()->json([
            'error' => 'Failed to fetch featured employers.'
        ], 500);
    }
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
                'video' => 'nullable|file|mimes:mp4,mov,avi|max:10240', // 10MB max
                'apply_before' => 'required|date',
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

            if ($request->hasFile('video')) {
                if ($job->video_path) {
                    Storage::disk('public')->delete($job->video_path);
                }
                $validatedData['video_path'] = $request->file('video')->store('job-videos', 'public');
            } else {
                unset($validatedData['video_path']);
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
            if ($job->video_path) {
                Storage::disk('public')->delete($job->video_path);
            }

            $job->delete();
            return response()->json(['message' => 'Job deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred while deleting the job.'], 500);
        }
    }


    

   public function categoriesWithCount()
    {
        try {
            $allCategories = ["IT", "Healthcare", "Construction", "Education", "Finance", "Marketing"];

            // Count only published jobs that have successful transactions
            $dbCategories = Job::where('is_published', true)
                ->whereHas('transactions', fn($q) => $q
                    ->where('job_posted', true)
                    ->where('status', 'succeeded')
                )
                ->select(DB::raw('LOWER(TRIM(classification)) as classification'), DB::raw('COUNT(*) as count'))
                ->groupBy(DB::raw('LOWER(TRIM(classification))'))
                ->pluck('count', 'classification')
                ->toArray();

            // Merge with predefined categories
            $categories = array_map(function ($cat) use ($dbCategories) {
                $key = strtolower($cat);
                return [
                    'classification' => $cat,
                    'count' => $dbCategories[$key] ?? 0,
                ];
            }, $allCategories);

            return response()->json([
                'message' => 'Categories with job count fetched successfully.',
                'categories' => $categories
            ]);
        } catch (\Throwable $e) {
            Log::error('Error fetching categories: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch categories'], 500);
        }
    }


   public function paidJobs(Request $request)
{
    try {
        $jobs = Job::where('is_published', true)
            ->whereHas('transactions', function ($q) {
                $q->where('job_posted', true)
                  ->where('amount', '>', 0)
                  ->where('status', 'succeeded');
            })
            ->with(['employer.profile', 'transactions'])
            // Order by the highest transaction amount
            ->withSum(['transactions as max_amount' => function ($q) {
                $q->where('job_posted', true)
                  ->where('status', 'succeeded');
            }], 'amount')
            ->get()
            ->sortByDesc('max_amount') // Sort descending by amount
            ->values()
            ->map(fn($job) => $this->processJobForFrontend($job));

        return response()->json([
            'message' => 'Featured paid jobs fetched successfully.',
            'jobs' => $jobs
        ]);
    } catch (\Throwable $e) {
        Log::error('Featured jobs fetch error: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to fetch featured jobs.'], 500);
    }
}



}
