<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use App\Models\Subscription;
use App\Models\Admin;
use App\Notifications\SubscriptionReminder;

class CheckSubscriptions extends Command
{
    protected $signature = 'subscriptions:notify';
    protected $description = 'Send reminders for subscriptions ending soon or expired';

    public function handle()
    {
        $today = Carbon::today();
        $subscriptions = Subscription::where('status', 'active')->get();

        foreach ($subscriptions as $subscription) {
            $user = $subscription->user;
            if (!$user) continue; // skip if user is missing

            $endDate = Carbon::parse($subscription->subscription_end_date);
            $daysLeft = $today->diffInDays($endDate, false);
            $isFreePlan = $subscription->plan_type === 'free';

            // Calculate remaining posts
            $maxPosts = $subscription->plan->max_posts ?? 0;
            $usedPosts = $subscription->used_posts ?? 0;
            $remainingPosts = max(0, $maxPosts - $usedPosts);

            // 🔔 Notify 1 day before end (or immediately if free plan)
            if (($daysLeft === 1 || ($isFreePlan && $daysLeft <= 0)) && !$subscription->notified_before_end) {
                $user->notify(new SubscriptionReminder($user, 'ending_soon', false, $daysLeft, $remainingPosts));

                foreach (Admin::all() as $admin) {
                    $admin->notify(new SubscriptionReminder($user, 'ending_soon', true, $daysLeft, $remainingPosts));
                }

                $subscription->update(['notified_before_end' => true]);
            }

            // 🔔 Notify if subscription expired
            if ($daysLeft < 0 && $subscription->status === 'active') {
                $user->notify(new SubscriptionReminder($user, 'ended', false, $daysLeft, $remainingPosts));

                foreach (Admin::all() as $admin) {
                    $admin->notify(new SubscriptionReminder($user, 'ended', true, $daysLeft, $remainingPosts));
                }

                $subscription->update(['status' => 'expired']);
            }
        }

        $this->info('Subscription notifications checked successfully.');
    }
}
