<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SubscriptionReminder extends Notification
{
    public $user;        // The subscription owner
    public $type;        // 'ending_soon' or 'ended'
    public $forAdmin;    // true if notification is for admin

    public function __construct($user, $type, $forAdmin = false)
    {
        $this->user = $user;
        $this->type = $type;
        $this->forAdmin = $forAdmin;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        if ($this->forAdmin) {
            // Admin message
            if ($this->type === 'ending_soon') {
                return (new MailMessage)
                    ->subject("Subscription Ending Soon for {$this->user->name}")
                    ->line("The subscription for user {$this->user->name} ({$this->user->email}) will expire tomorrow.");
            } else {
                return (new MailMessage)
                    ->subject("Subscription Expired for {$this->user->name}")
                    ->line("The subscription for user {$this->user->name} ({$this->user->email}) has ended.");
            }
        } else {
            // Normal user message
            if ($this->type === 'ending_soon') {
                return (new MailMessage)
                    ->subject('Your subscription is ending soon')
                    ->line("Hi {$this->user->name}, your subscription will expire tomorrow. Please renew it to continue accessing all features.");
            } else {
                return (new MailMessage)
                    ->subject('Your subscription has ended')
                    ->line("Hi {$this->user->name}, your subscription has ended. Please renew to regain full access.");
            }
        }
    }
}
