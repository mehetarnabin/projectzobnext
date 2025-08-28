<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;
use App\Models\User;
use App\Models\Company;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    // Fetch user profile data (unified for jobseeker and employer)
    public function show()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Load the profile, create if it doesn't exist
        $profile = $user->profile()->firstOrCreate([
            'user_id' => $user->id
        ], [
            'email' => $user->email,
            'phone' => $user->phone_number,
            'logo_url' => asset('images/default_profile.jpg'),
            'banner_url' => asset('images/default_banner.png'),
            'show_email' => true,
            'show_phone' => true,
            'show_address' => true,
            'about' => 'Write something about yourself here...',
            'education' => [],
            'work_experience' => [],
            'memberships' => [],
            'certifications' => [],
            'licenses' => [],
        ]);

        // Ensure current data is used, especially if profile was just created
        $currentProfileData = $profile->fresh(); // Get the latest state after firstOrCreate

        $bannerUrl = $currentProfileData->banner_url;
        $logoUrl = $currentProfileData->logo_url;

         // Check if it's a default image or a stored image
        if (str_starts_with($bannerUrl, 'images/default_')) {
            $bannerUrl = asset($bannerUrl); // Serve directly from public/images
        } else {
            $bannerUrl = asset('storage/' . $bannerUrl); // Serve from storage for uploaded images
        }

        if (str_starts_with($logoUrl, 'images/default_')) {
            $logoUrl = asset($logoUrl); // Serve directly from public/images
        } else {
            $logoUrl = asset('storage/' . $logoUrl); // Serve from storage for uploaded images
        }

        // Prepare profile data for frontend
        $profileData = [
            'id' => $currentProfileData->id,
            'name' => $user->name,
            'designation' => $user->designation, // Fetch designation from User model
            'logoUrl' => $logoUrl, // User's profile logo
            'bannerUrl' => $bannerUrl, // User's profile banner
            'github' => $currentProfileData->github,
            'linkedin' => $currentProfileData->linkedin,
            'facebook' => $currentProfileData->facebook,
            'instagram' => $currentProfileData->instagram,
            'twitter' => $currentProfileData->twitter,
            'badges' => $currentProfileData->badges ?? [], // User's profile badges
            'basicInfo' => [
                'email' => $currentProfileData->email,
                'phone' => $currentProfileData->phone,
                'country' => $currentProfileData->country,
                'address' => $currentProfileData->address,
                'showEmail' => (bool) $currentProfileData->show_email,
                'showPhone' => (bool) $currentProfileData->show_phone,
                'showAddress' => (bool) $currentProfileData->show_address,
            ],
            'about' => $currentProfileData->about,
            'education' => $currentProfileData->education ?? [],
            'work_experience' => [], // Ensure this is initialized as an array
            'memberships' => $currentProfileData->memberships ?? [],
            'certifications' => $currentProfileData->certifications ?? [],
            'licenses' => $currentProfileData->licenses ?? [],
            'role' => $user->role,
        ];

        // For employers/staffing, also include company data if available
        if (in_array($user->role, ['employer', 'staffing']) && $user->company) {
            $company = $user->company;
            $profileData['company'] = [
                'id' => $company->id,
                'name' => $company->name,
                'email' => $company->email,
                'phone_number' => $company->phone_number,
                'address' => $company->address,
                'website' => $company->website,
                'logo_url' => str_starts_with($company->logo_url, 'images/default_') ? asset($company->logo_url) : asset('storage/' . $company->logo_url),
                'banner_url' => str_starts_with($company->banner_url, 'images/default_') ? asset($company->banner_url) : asset('storage/' . $company->banner_url),
                'badges' => $company->badges ?? [],
            ];
            // Fetch all users belonging to the same company as the current user
            // We will filter for 'Manager' designation on the frontend.
            $profileData['company_users'] = User::where('company_id', $company->id)->get()->map(function($companyUser) {
                $userProfile = $companyUser->profile()->firstOrCreate(['user_id' => $companyUser->id]);
                return [
                    'id' => $companyUser->id,
                    'name' => $companyUser->name,
                    'designation' => $companyUser->designation,
                    'logo_url' => str_starts_with($userProfile->logo_url, 'images/default_') ? asset($userProfile->logo_url) : asset('storage/' . $userProfile->logo_url),
                ];
            });
        } else {
            $profileData['company'] = null; // Ensure company is null for jobseekers
            $profileData['company_users'] = []; // Ensure company_users is empty for jobseekers
        }


        return response()->json($profileData);
    }

    // Update profile header data (unified for jobseeker and employer)
    public function updateHeader(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            $profile = $user->profile;

            // Validate common fields
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'designation' => 'nullable|string|max:255', // Designation is now on User model
                'logoUrl' => 'nullable|string', // Base64 or URL
                'bannerUrl' => 'nullable|string', // Base64 or URL
                'github' => 'nullable|url|max:255',
                'linkedin' => 'nullable|url|max:255',
                'facebook' => 'nullable|url|max:255',
                'instagram' => 'nullable|url|max:255',
                'twitter' => 'nullable|url|max:255',
                'badges' => 'nullable|array|max:4', // Max 4 badges
                'badges.*' => 'nullable|string', // Each badge can be base64 or URL
            ]);

            // Update user's name and designation directly on the User model
            $user->name = $validated['name'];
            $user->designation = $validated['designation']; // Update user's designation
            $user->save(); // Save user table changes

            // Prepare data for profile update (Profile model stores social links and personal badges)
            $profileData = [
                'github' => $validated['github'],
                'linkedin' => $validated['linkedin'],
                'facebook' => $validated['facebook'],
                'instagram' => $validated['instagram'],
                'twitter' => $validated['twitter'],
                'badges' => [], // Reset badges to populate them
            ];

            // Handle logo upload for user profile
            if ($request->has('logoUrl') && $validated['logoUrl'] && str_starts_with($validated['logoUrl'], 'data:image')) {
                $logoPath = $this->saveBase64Image($validated['logoUrl'], 'profile_logos', $user->id . '_logo');
                $profileData['logo_url'] = $logoPath;
            } elseif ($validated['logoUrl'] === null) {
                $profileData['logo_url'] = 'images/default_profile.jpg';
            }

            // Handle banner upload for user profile
            if ($request->has('bannerUrl') && $validated['bannerUrl'] && str_starts_with($validated['bannerUrl'], 'data:image')) {
                $bannerPath = $this->saveBase64Image($validated['bannerUrl'], 'profile_banners', $user->id . '_banner');
                $profileData['banner_url'] = $bannerPath;
            } elseif ($validated['bannerUrl'] === null) {
                $profileData['banner_url'] = 'images/default_banner.png';
            }

            // Handle badge uploads for user profile (if they are base64)
            if ($request->has('badges') && is_array($request->badges)) {
                $processedBadges = [];
                foreach ($request->badges as $index => $badge) {
                    if ($badge && str_starts_with($badge, 'data:image')) {
                        $badgePath = $this->saveBase64Image($badge, 'profile_badges', $user->id . '_badge_' . $index);
                        $processedBadges[] = url(Storage::url($badgePath));
                    } else if ($badge) {
                        $processedBadges[] = $badge;
                    }
                }
                $profileData['badges'] = $processedBadges;
            } else {
                $profileData['badges'] = [];
            }

            $profile->update($profileData);

            return response()->json(['message' => 'Profile header updated successfully!']);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating profile header: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
            return response()->json(['message' => 'Error updating profile header.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Fetch employer specific profile data (company details + user details within company).
     * This is a new method for employer profile page.
     */
    public function showEmployerProfile()
    {
        $user = Auth::user();
        if (!$user || !in_array($user->role, ['employer', 'staffing'])) {
            return response()->json(['message' => 'Unauthorized or not an employer/staffing user'], 401);
        }

        $company = $user->company;
        if (!$company) {
            return response()->json(['message' => 'Company not found for this user'], 404);
        }

        $companyLogoUrl = str_starts_with($company->logo_url, 'images/default_') ? asset($company->logo_url) : asset('storage/' . $company->logo_url);
        $companyBannerUrl = str_starts_with($company->banner_url, 'images/default_') ? asset($company->banner_url) : asset('storage/' . $company->banner_url);

        // User's own profile logo (from Profile model, or default)
        $userProfile = $user->profile()->firstOrCreate(['user_id' => $user->id]);
        $userLogoUrl = str_starts_with($userProfile->logo_url, 'images/default_') ? asset($userProfile->logo_url) : asset('storage/' . $userProfile->logo_url);

        // Fetch all users belonging to the same company as the current user
        // We will filter for 'Manager' designation on the frontend.
        $companyUsers = User::where('company_id', $company->id)->get()->map(function($companyUser) {
            $userProfile = $companyUser->profile()->firstOrCreate(['user_id' => $companyUser->id]);
            return [
                'id' => $companyUser->id,
                'name' => $companyUser->name,
                'designation' => $companyUser->designation,
                'logo_url' => str_starts_with($userProfile->logo_url, 'images/default_') ? asset($userProfile->logo_url) : asset('storage/' . $userProfile->logo_url),
            ];
        });


        $employerProfileData = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'designation' => $user->designation, // User's designation from User model
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'logo_url' => $userLogoUrl, // User's personal logo
            ],
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'email' => $company->email,
                'phone_number' => $company->phone_number,
                'address' => $company->address,
                'website' => $company->website,
                'logo_url' => $companyLogoUrl, // Company logo
                'banner_url' => $companyBannerUrl, // Company banner
                'badges' => $company->badges ?? [], // Company badges
            ],
            'company_users' => $companyUsers, // ADDED: All users in the company to filter managers on frontend
        ];

        return response()->json($employerProfileData);
    }

    /**
     * Update company header data (for employer role).
     * This is a new method for employer profile page.
     */
    public function updateCompanyHeader(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || !in_array($user->role, ['employer', 'staffing'])) {
                return response()->json(['message' => 'Unauthorized or not an employer/staffing user'], 401);
            }

            $company = $user->company;
            if (!$company) {
                return response()->json(['message' => 'Company not found for this user'], 404);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone_number' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'website' => 'nullable|url|max:255',
                'logoUrl' => 'nullable|string', // Base64 or URL
                'bannerUrl' => 'nullable|string', // Base64 or URL
                'badges' => 'nullable|array|max:4', // Max 4 badges
                'badges.*' => 'nullable|string', // Each badge can be base64 or URL
                // 'manager' => 'nullable|string|max:255', // REMOVED: Validation for manager field
            ]);

            $companyData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'],
                'address' => $validated['address'],
                'website' => $validated['website'],
                'badges' => [],
                // 'manager' => $validated['manager'], // REMOVED: Save manager field
            ];

            // Handle company logo upload
            if ($request->has('logoUrl') && $validated['logoUrl'] && str_starts_with($validated['logoUrl'], 'data:image')) {
                $logoPath = $this->saveBase64Image($validated['logoUrl'], 'company_logos', $company->id . '_logo');
                $companyData['logo_url'] = $logoPath;
            } elseif ($validated['logoUrl'] === null) {
                $companyData['logo_url'] = 'images/default_profile.jpg'; // Default company logo
            }

            // Handle company banner upload
            if ($request->has('bannerUrl') && $validated['bannerUrl'] && str_starts_with($validated['bannerUrl'], 'data:image')) {
                $bannerPath = $this->saveBase64Image($validated['bannerUrl'], 'company_banners', $company->id . '_banner');
                $companyData['banner_url'] = $bannerPath;
            } elseif ($validated['bannerUrl'] === null) {
                $companyData['banner_url'] = 'images/default_banner.png'; // Default company banner
            }

            // Handle company badge uploads
            if ($request->has('badges') && is_array($request->badges)) {
                $processedBadges = [];
                foreach ($request->badges as $index => $badge) {
                    if ($badge && str_starts_with($badge, 'data:image')) {
                        $badgePath = $this->saveBase64Image($badge, 'company_badges', $company->id . '_badge_' . $index);
                        $processedBadges[] = url(Storage::url($badgePath));
                    } else if ($badge) {
                        $processedBadges[] = $badge;
                    }
                }
                $companyData['badges'] = $processedBadges;
            } else {
                $companyData['badges'] = [];
            }

            $company->update($companyData);

            return response()->json(['message' => 'Company profile updated successfully!']);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating company profile: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
            return response()->json(['message' => 'Error updating company profile.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the current employer user's profile details (name, designation, email, phone).
     * This is a new method for employer profile page.
     */
    public function updateEmployerUserProfile(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || !in_array($user->role, ['employer', 'staffing'])) {
                return response()->json(['message' => 'Unauthorized or not an employer/staffing user'], 401);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'designation' => 'nullable|string|max:255', // Designation is updated here for the user
                'email' => [
                    'required',
                    'email',
                    'max:255',
                    function ($attribute, $value, $fail) use ($user) {
                        if ($value && $value !== $user->email && User::where('email', $value)->exists()) {
                            $fail('The ' . $attribute . ' has already been taken.');
                        }
                    },
                ],
                'phone_number' => [
                    'nullable',
                    'string',
                    'max:20',
                    function ($attribute, $value, $fail) use ($user) {
                        if ($value && $value !== $user->phone_number && User::where('phone_number', $value)->exists()) {
                            $fail('The phone number has already been taken.');
                        }
                    },
                ],
                'logoUrl' => 'nullable|string', // User's personal logo
            ]);

            // Update user details directly on the User model
            $user->name = $validated['name'];
            $user->designation = $validated['designation']; // Update user's designation
            $user->email = $validated['email'];
            $user->phone_number = $validated['phone_number'];

            // Update user's personal profile logo if provided
            $profile = $user->profile()->firstOrCreate(['user_id' => $user->id]);
            if ($request->has('logoUrl') && $validated['logoUrl'] && str_starts_with($validated['logoUrl'], 'data:image')) {
                $logoPath = $this->saveBase64Image($validated['logoUrl'], 'profile_logos', $user->id . '_personal_logo');
                $profile->logo_url = $logoPath;
            } elseif ($validated['logoUrl'] === null) {
                $profile->logo_url = 'images/default_profile.jpg';
            }
            $profile->save(); // Save profile changes

            $user->save(); // Save user changes

            return response()->json(['message' => 'Your profile details updated successfully!']);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating employer user profile: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
            return response()->json(['message' => 'Error updating employer user profile.', 'error' => $e->getMessage()], 500);
        }
    }


    public function updateBasicInfo(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            $profile = $user->profile;

            $validated = $request->validate([
                'email' => [
                    'nullable',
                    'email',
                    'max:255',
                    // Validate email uniqueness only if it's different from the current user's email
                    // This rule should apply to the users table
                    function ($attribute, $value, $fail) use ($user) {
                        if ($value && $value !== $user->email && User::where('email', $value)->exists()) {
                            $fail('The ' . $attribute . ' has already been taken.');
                        }
                    },
                ],
                'phone' => [
                    'nullable',
                    'string',
                    'max:20',
                    // Validate phone uniqueness only if it's different from the current user's phone_number
                    // This rule should apply to the users table
                    function ($attribute, $value, $fail) use ($user) {
                        if ($value && $value !== $user->phone_number && User::where('phone_number', $value)->exists()) {
                            $fail('The phone number has already been taken.');
                        }
                    },
                ],
                'country' => 'nullable|string|max:5',
                'address' => 'nullable|string|max:500',
                'showEmail' => 'required|boolean',
                'showPhone' => 'required|boolean',
                'showAddress' => 'required|boolean',
            ]);

            // Update email in users table if changed and provided
            if ($validated['email'] !== null && $user->email !== $validated['email']) {
                $user->email = $validated['email'];
            }
            // Update phone_number in users table if changed and provided
            if ($validated['phone'] !== null && $user->phone_number !== $validated['phone']) {
                $user->phone_number = $validated['phone'];
            }
            $user->save(); // Save user changes

            // Update profile table
            $profile->update([
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'country' => $validated['country'],
                'address' => $validated['address'],
                'show_email' => $validated['showEmail'],
                'show_phone' => $validated['showPhone'],
                'show_address' => $validated['showAddress'],
            ]);

            return response()->json(['message' => 'Basic info updated successfully!']);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating basic info: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
            return response()->json(['message' => 'Error updating basic info.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the 'about' section of the user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAboutMe(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            $profile = $user->profile;

            $validated = $request->validate([
                'about' => 'nullable|string|max:3000', // Validate the 'about' field
            ]);

            $profile->update([
                'about' => $validated['about'],
            ]);

            return response()->json(['message' => 'About Me section updated successfully!']);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating About Me: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
            return response()->json(['message' => 'Error updating About Me.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the 'education' section of the user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateEducation(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            $profile = $user->profile;

            // Validate the incoming education array
            $validated = $request->validate([
                'education' => 'nullable|array',
                'education.*.degree' => 'required|string|max:255',
                'education.*.institution' => 'required|string|max:255',
                'education.*.startDate' => 'required|integer|min:1900|max:' . (date('Y') + 5), // <--- CHANGED THIS VALIDATION
                'education.*.endDate' => 'required|integer|min:1900|max:' . (date('Y') + 5) . '|after_or_equal:education.*.startDate', // <--- CHANGED THIS VALIDATION
                'education.*.grade' => 'nullable|string|max:255',
                'education.*.highlights' => 'nullable|string|max:1000',
                'education.*.logo' => 'nullable|url|max:500',
                'education.*.honors' => 'nullable|boolean',
            ]);

            // Save the entire education array
            $profile->update([
                'education' => $validated['education'],
            ]);

            return response()->json(['message' => 'Education updated successfully!']);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating Education: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
            return response()->json(['message' => 'Error updating Education.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the 'work_experience' section of the user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateWorkExperience(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            $profile = $user->profile;

            // Validate the incoming work_experience array
            $validated = $request->validate([
                'work_experience' => 'nullable|array',
                'work_experience.*.title' => 'required|string|max:255',
                'work_experience.*.company' => 'required|string|max:255',
                'work_experience.*.startDate' => 'required|date_format:Y-m-d', // Expect full date for start
                // endDate is nullable for "Present", but if present, it must be a date and after or equal to startDate
                'work_experience.*.endDate' => 'nullable|date_format:Y-m-d|after_or_equal:work_experience.*.startDate',
                'work_experience.*.details' => 'nullable|string|max:1000',
                'work_experience.*.logo' => 'nullable|url|max:500',
            ]);

            // Save the entire work_experience array
            $profile->update([
                'work_experience' => $validated['work_experience'],
            ]);

            return response()->json(['message' => 'Work experience updated successfully!']);

        } catch (ValidationException $e) {
            // This is how Laravel's default validation exception structured.
            // It puts errors in an array keyed by field name.
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating Work Experience: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
            return response()->json(['message' => 'Error updating Work Experience.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the 'memberships' section of the user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateMemberships(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            $profile = $user->profile;

            // Validate the incoming memberships array
            $validated = $request->validate([
                'memberships' => 'nullable|array',
                'memberships.*.org' => 'required|string|max:255',
                'memberships.*.type' => 'required|string|max:255',
                'memberships.*.year' => 'required|integer|min:1900|max:' . (date('Y') + 5), // Validate year
                'memberships.*.end' => 'nullable|integer|min:1900|max:' . (date('Y') + 5) . '|after_or_equal:memberships.*.year', // End year can be null, but if present, validate
                'memberships.*.logo' => 'nullable|url|max:500',
            ]);

            // Save the entire memberships array
            $profile->update([
                'memberships' => $validated['memberships'],
            ]);

            return response()->json(['message' => 'Professional memberships updated successfully!']);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating Memberships: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
            return response()->json(['message' => 'Error updating Memberships.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the 'certifications' section of the user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCertifications(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            $profile = $user->profile;

            // Validate the incoming certifications array
            $validated = $request->validate([
                'certifications' => 'nullable|array',
                'certifications.*.title' => 'required|string|max:255',
                'certifications.*.provider' => 'required|string|max:255',
                'certifications.*.country' => 'required|string|max:255',
                'certifications.*.year' => 'required|integer|min:1900|max:' . (date('Y') + 5), // Validate year
                'certifications.*.expiry' => 'nullable|integer|min:1900|max:' . (date('Y') + 15) . '|after_or_equal:certifications.*.year', // Expiry can be null, but if present, validate
                'certifications.*.logo' => 'nullable|url|max:500',
            ]);

            // Save the entire certifications array
            $profile->update([
                'certifications' => $validated['certifications'],
            ]);

            return response()->json(['message' => 'Training & Certifications updated successfully!']);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating Certifications: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
            return response()->json(['message' => 'Error updating Certifications.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the 'licenses' section of the user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateLicenses(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            $profile = $user->profile;

            // Validate the incoming licenses array
            $validated = $request->validate([
                'licenses' => 'nullable|array',
                'licenses.*.type' => 'required|string|max:255',
                'licenses.*.authority' => 'required|string|max:255',
                'licenses.*.issued' => 'required|integer|min:1900|max:' . (date('Y') + 5), // Validate issued year
                'licenses.*.expiry' => 'nullable|integer|min:1900|max:' . (date('Y') + 15) . '|after_or_equal:licenses.*.issued', // Expiry can be null, but if present, validate
            ]);

            $profile->update([
                'licenses' => $validated['licenses'],
            ]);

            return response()->json(['message' => 'Licenses updated successfully!']);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating Licenses: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in file ' . $e->getFile());
            return response()->json(['message' => 'Error updating Licenses.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Helper function to save base64 encoded images.
     *
     * @param string $base64_image
     * @param string $folder
     * @param string $name_prefix
     * @return string Stored file path
     */
    private function saveBase64Image($base64_image, $folder, $name_prefix)
    {
        // Decode the base64 string
        list($type, $base64_image) = explode(';', $base64_image);
        list(, $base64_image)      = explode(',', $base64_image);
        $image_data = base64_decode($base64_image);

        // Determine the image extension
        $mime_type = finfo_buffer(finfo_open(), $image_data, FILEINFO_MIME_TYPE);
        $extension = explode('/', $mime_type)[1]; // e.g., 'png', 'jpeg'

        $fileName = $name_prefix . '_' . time() . '.' . $extension;
        $path = $folder . '/' . $fileName;

        Storage::disk('public')->put($path, $image_data);

        return $path;
    }
}
