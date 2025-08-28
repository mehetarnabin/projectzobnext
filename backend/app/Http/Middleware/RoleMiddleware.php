<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = Auth::user();

        if (!$user) { // Should be covered by Auth::check(), but good for safety
            return response()->json(['message' => 'User not found.'], 401);
        }

        // Check if the user has any of the required roles
        if (!in_array($user->role, $roles)) {
            return response()->json(['message' => 'Forbidden: You do not have the required role.'], 403);
        }

        return $next($request);
    }
}