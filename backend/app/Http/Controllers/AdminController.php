<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Traits\ApiResponseTrait;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AdminController extends Controller
{
    use ApiResponseTrait;

    /**
     * Register a new admin
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:admins,email',
            'password' => 'required|string|min:6',
        ]);

        $admin = Admin::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = JWTAuth::fromUser($admin);

        return $this->success([
            'admin' => $admin,
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60
        ], 'Admin registered successfully');
    }

    /**
     * Admin login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        $admin = Admin::where('email', $credentials['email'])->first();

        if (!$admin || !Hash::check($credentials['password'], $admin->password)) {
            return $this->error('Invalid login credentials.', 401);
        }

        // Generate JWT token for admin
        $token = JWTAuth::fromUser($admin);

        return $this->success([
            'admin' => $admin,
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60
        ], 'Admin login successful');
    }

    /**
     * Admin logout
     */
    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return $this->success([], 'Admin logged out successfully');
        } catch (JWTException $e) {
            return $this->error('Failed to logout, please try again.', 500);
        }
    }

    /**
     * Get authenticated admin info
     */
    public function me(Request $request)
    {
        try {
            $admin = JWTAuth::parseToken()->authenticate();
            return $this->success(['admin' => $admin], 'Admin info retrieved successfully');
        } catch (JWTException $e) {
            return $this->error('Token invalid or expired.', 401);
        }
    }
}
