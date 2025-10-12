<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SubscriptionReminder extends Notification
{
    public $user;        
    public $type;        
    public $forAdmin;    
    public $daysLeft;    
    public $remainingPosts;

    public function __construct($user, $type, $forAdmin = false, $daysLeft = null, $remainingPosts = null)
    {
        $this->user = $user;
        $this->type = $type;
        $this->forAdmin = $forAdmin;
        $this->daysLeft = $daysLeft;
        $this->remainingPosts = $remainingPosts;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        // 🧠 Compose messages dynamically
        if ($this->forAdmin) {
            // Message for admin
            if ($this->type === 'ending_soon') {
                return (new MailMessage)
                    ->subject("Subscription Ending Soon for {$this->user->name}")
                    ->line("The subscription for user {$this->user->name} ({$this->user->email}) will expire in {$this->daysLeft} day(s).")
                    ->line("Remaining job posts: {$this->remainingPosts}");
            } else {
                return (new MailMessage)
                    ->subject("Subscription Expired for {$this->user->name}")
                    ->line("The subscription for user {$this->user->name} ({$this->user->email}) has expired.")
                    ->line("They had {$this->remainingPosts} unused job post(s) before expiry.");
            }
        } else {
            // Message for employer/user
            if ($this->type === 'ending_soon') {
                return (new MailMessage)
                    ->subject('Your subscription is ending soon')
                    ->greeting("Hello {$this->user->name},")
                    ->line("Your subscription will expire in {$this->daysLeft} day(s).")
                    ->line("You currently have {$this->remainingPosts} job post(s) remaining.")
                    ->line('Please renew soon to continue posting jobs.')
                    ->action('Renew Now', url('/plans'))
                    ->line('Thank you for using our service!');
            } else {
                return (new MailMessage)
                    ->subject('Your subscription has ended')
                    ->greeting("Hello {$this->user->name},")
                    ->line('Your subscription has ended.')
                    ->line("You had {$this->remainingPosts} unused job post(s) at the time of expiry.")
                    ->line('Renew your plan to regain access.')
                    ->action('Renew Subscription', url('/plans'))
                    ->line('We look forward to having you back!');
            }
        }
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => $this->type,
            'user_name' => $this->user->name,
            'days_left' => $this->daysLeft,
            'remaining_posts' => $this->remainingPosts,
            'message' => $this->type === 'ending_soon'
                ? "Your subscription will expire in {$this->daysLeft} day(s). You have {$this->remainingPosts} posts remaining."
                : "Your subscription has ended. You had {$this->remainingPosts} posts remaining.",
        ];
    }

}
