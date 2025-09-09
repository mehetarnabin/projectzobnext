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
            $endDate = Carbon::parse($subscription->subscription_end_date);
            $daysLeft = $today->diffInDays($endDate, false);
            $isFreePlan = $subscription->plan_type === 'free';

            // Reminder 1 day before end
            if (($daysLeft === 1) || ($isFreePlan && $daysLeft <= 0 && !$subscription->notified_before_end)) {
                $user->notify(new SubscriptionReminder($user, 'ending_soon'));
                foreach (Admin::all() as $admin) {
                    $admin->notify(new SubscriptionReminder($user, 'ending_soon', true));
                }
                $subscription->update(['notified_before_end' => true]);
            }

            // Subscription expired
            if ($daysLeft < 0 && $subscription->status === 'active') {
                $user->notify(new SubscriptionReminder($user, 'ended'));
                foreach (Admin::all() as $admin) {
                    $admin->notify(new SubscriptionReminder($user, 'ended', true));
                }
                $subscription->update(['status' => 'expired']);
            }
        }

        $this->info('Subscription notifications checked.');
    }
}
