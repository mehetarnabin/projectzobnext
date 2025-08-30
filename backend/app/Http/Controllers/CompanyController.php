<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Traits\ApiResponseTrait; // Make sure this trait exists and is correctly implemented

class CompanyController extends Controller
{
    use ApiResponseTrait; // If you use this trait, ensure it's defined in your project

    /**
     * Get managers for a specific company.
     *
     * @param int $companyId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCompanyManagers($companyId)
    {
        $user = Auth::user();

        if (!$user) {
            return $this->error('Unauthenticated.', 401);
        }

        // Optional: Add a check to ensure the requesting user belongs to this company
        // For a more robust solution, you'd implement a policy or middleware here.
        // For now, we'll allow any authenticated user to fetch managers if they know the companyId.
        // If you want to restrict, uncomment and adapt the following:
        // if ($user->company_id != $companyId && !($user->role === 'admin')) { // Assuming an 'admin' role
        //      return $this->error('Unauthorized to view this company\'s managers.', 403);
        // }

        $company = Company::find($companyId);

        if (!$company) {
            // Use the error method from ApiResponseTrait
            return $this->error('Company not found.', 404);
        }

        // Fetch users (employees) of this company who have a 'manager' designation
        // This assumes 'designation' is stored on the Profile model.
        // It also loads the profile to get the logo_url.
        $managers = User::where('company_id', $company->id)
                        ->whereHas('profile', function ($query) {
                            $query->where('designation', 'like', '%Manager%')
                                  ->orWhere('designation', 'like', '%manager%'); // Case-insensitive check
                        })
                        ->with('profile') // Eager load profile to get logo_url
                        ->get(['id', 'name', 'email', 'phone_number']); // Select necessary user fields

        // Filter out the current user if they are also a manager and you don't want them listed
        $managers = $managers->filter(fn($manager) => $manager->id !== $user->id)->values();

        // Use the success method from ApiResponseTrait
        return $this->success([
            'managers' => $managers,
        ], 'Company managers fetched successfully.');
    }
}
