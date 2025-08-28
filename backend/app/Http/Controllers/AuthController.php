<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\User;
use App\Models\Company; // Import the Company model
use Illuminate\Support\Facades\Hash;
use App\Traits\ApiResponseTrait;
use App\Models\Profile;
use Illuminate\Validation\Rule; // Import Rule for conditional validation

class AuthController extends Controller
{
    use ApiResponseTrait;

    public function register(Request $request)
    {
        \Log::info('REGISTER HIT');

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:jobseeker,employer,staffing',
            'phone_number' => 'required|string|max:20',
            // company_name is required IF role is employer/staffing AND company_id is NOT provided
            'company_name' => [
                Rule::requiredIf(function () use ($request) {
                    return in_array($request->role, ['employer', 'staffing']) && empty($request->company_id);
                }),
                'nullable', // Can be null if company_id is provided
                'string',
                'max:255',
            ],
            // company_id is required IF role is employer/staffing AND company_name is NOT provided
            'company_id' => [
                Rule::requiredIf(function () use ($request) {
                    return in_array($request->role, ['employer', 'staffing']) && empty($request->company_name);
                }),
                'nullable', // Can be null if company_name is provided (for new company)
                'integer',
                'exists:companies,id', // Ensures the company_id actually exists in the companies table
            ],
        ]);

        $companyId = null;

        // Logic for employer/staffing roles
        if (in_array($validatedData['role'], ['employer', 'staffing'])) {
            if (!empty($validatedData['company_id'])) {
                // User selected an existing company by ID
                $companyId = $validatedData['company_id'];
            } elseif (!empty($validatedData['company_name'])) {
                // User provided a new company name, so create a new company
                $company = Company::create([
                    'name' => $validatedData['company_name'],
                    'email' => $validatedData['email'], // Use user's email as company email for simplicity
                    'phone_number' => $validatedData['phone_number'], // Use user's phone as company phone for simplicity
                    'logo_url' => 'images/default_profile.jpg',
                    'banner_url' => 'images/default_banner.png',
                    'badges' => [],
                ]);
                $companyId = $company->id;
            }
            // If neither company_id nor company_name is provided for employer/staffing,
            // validation will catch it due to the Rule::requiredIf conditions above.
        }

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'role' => $validatedData['role'],
            'phone_number' => $validatedData['phone_number'],
            'company_id' => $companyId, // Assign the company_id (will be null for jobseekers)
            'designation' => null, // Default designation to null on registration
        ]);

        // After user creation, ensure a profile is created for them
        $user->profile()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'email' => $user->email,
                'phone' => $user->phone_number,
                'banner_url' => 'images/default_banner.png',
                'logo_url' => 'images/default_profile.jpg',
                'show_email' => true,
                'show_phone' => true,
                'show_address' => true,
            ]
        );

        $token = JWTAuth::fromUser($user);

        return $this->success([
            'user' => $user,
            'token' => $token,
        ], 'User created successfully!');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'role' => 'required|string|in:jobseeker,employer,staffing',
        ]);

        $credentials = $request->only('email', 'password');
        $requestedRole = $request->input('role');

        if (!$token = JWTAuth::attempt($credentials)) {
            return $this->error('Invalid login credentials.', 401);
        }

        $user = Auth::user();

        if ($user->role !== $requestedRole) {
        return $this->error('Role mismatch. You cannot login as this role.', 403);
    }

        return $this->success([
            'user' => Auth::user(),
            'token' => $token,
        ], 'Login successful!');
    }

    public function getAuthenticatedUser(Request $request)
    {
        return $this->success([
            'user' => $request->user(),
        ], 'Authenticated user fetched.');
    }

    public function logout()
    {
        try {
            auth()->logout();
            return $this->success([], 'Successfully logged out.');
        } catch (\Exception $e) {
            return $this->error('Failed to logout. ' . $e->getMessage(), 500);
        }
    }

    public function refresh()
    {
        try {
            $newToken = auth()->refresh();
            return $this->success(['token' => $newToken], 'Token refreshed.');
        } catch (\Exception $e) {
            return $this->error('Token refresh failed. ' . $e->getMessage(), 401);
        }
    }
}
