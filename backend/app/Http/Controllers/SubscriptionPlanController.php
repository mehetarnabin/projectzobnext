<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use App\Traits\ApiResponseTrait;

class SubscriptionPlanController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $type = $request->query('type');
        $plans = SubscriptionPlan::when($type, fn($q) => $q->where('plan_type', $type))->get();

        return $this->success($plans, 'Subscription plans fetched successfully.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'plan_type'   => 'required|in:employer,jobseeker',
            'name'        => 'required|string|max:255',
            'price'       => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'features'    => 'nullable|array',
            'recommended' => 'nullable|boolean',
        ]);

        $plan = SubscriptionPlan::create($validated);

        return $this->success($plan, 'Subscription plan created successfully.');
    }

    public function update(Request $request, $id)
    {
        $plan = SubscriptionPlan::find($id);
        if (!$plan) return $this->error('Plan not found', 404);

        $validated = $request->validate([
            'plan_type'   => 'sometimes|in:employer,jobseeker',
            'name'        => 'sometimes|string|max:255',
            'price'       => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'features'    => 'nullable|array',
            'recommended' => 'nullable|boolean',
        ]);

        $plan->update($validated);

        return $this->success($plan, 'Subscription plan updated successfully.');
    }

    public function destroy($id)
    {
        $plan = SubscriptionPlan::find($id);
        if (!$plan) return $this->error('Plan not found', 404);

        $plan->delete();

        return $this->success([], 'Subscription plan deleted successfully.');
    }
}
