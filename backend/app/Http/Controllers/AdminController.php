<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Traits\ApiResponseTrait;

class AdminController extends Controller
{
    use ApiResponseTrait;

    // Register a new admin
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $admin = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => 'admin',
        ]);

        $token = JWTAuth::fromUser($admin);

        return $this->success([
            'user'  => $admin,
            'token' => $token,
        ], 'Admin registered successfully');
    }

    // Login admin
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return $this->error('Invalid login credentials.', 401);
        }

        $user = Auth::user();
        if ($user->role !== 'admin') {
            return $this->error('Unauthorized: Only admins can login here.', 403);
        }

        return $this->success([
            'user'  => $user,
            'token' => $token,
        ], 'Admin login successful');
    }
}
