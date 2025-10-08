<?php



namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Get employer's active subscription with remaining job posts.
     */
    public function active()
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $subscription = Subscription::where('user_id', $userId)
            ->where('status', 'active')
            ->where('subscription_end_date', '>=', now())
            ->with('plan') // includes plan details
            ->first();

        if (!$subscription) {
            return response()->json([
                'active' => false,
                'message' => 'No active subscription found.'
            ]);
        }

        // Calculate remaining posts
        $maxPosts = $subscription->plan->max_posts ?? 0;
        $usedPosts = $subscription->used_posts ?? 0;
        $remainingPosts = max(0, $maxPosts - $usedPosts);

        return response()->json([
            'active' => true,
            'subscription' => [
                'plan_name' => $subscription->plan->name ?? 'N/A',
                'max_posts' => $maxPosts,
                'used_posts' => $usedPosts,
                'remaining_posts' => $remainingPosts,
                'expires_on' => $subscription->subscription_end_date,
            ],
        ]);
    }
}
