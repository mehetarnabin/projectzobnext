<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        // Employer Plans
        SubscriptionPlan::insert([
            [
                'plan_type' => 'employer',
                'name' => 'Free',
                'price' => 0,
                'description' => 'Reach a small pool of candidates.',
                'features' => json_encode([
                    'visibility' => true,
                    'highlight' => false,
                    'analytics' => false,
                    'duration' => '1 Days',
                    'priorityListing' => false,
                    'branding' => false,
                    'socialPromo' => false,
                    'emailAlert' => false,
                    'support' => 'Standard',
                ]),
                'recommended' => false,
                'max_posts' => 1,
            ],
            [
                'plan_type' => 'employer',
                'name' => 'Basic',
                'price' => 99,
                'description' => 'Better visibility with more reach.',
                'features' => json_encode([
                    'visibility' => true,
                    'highlight' => true,
                    'analytics' => false,
                    'duration' => '14 Days',
                    'priorityListing' => true,
                    'branding' => false,
                    'socialPromo' => false,
                    'emailAlert' => true,
                    'support' => 'Standard',
                ]),
                'recommended' => false,
                'max_posts' => 5,
            ],
            [
                'plan_type' => 'employer',
                'name' => 'Advance',
                'price' => 149,
                'description' => 'Top visibility and branding.',
                'features' => json_encode([
                    'visibility' => true,
                    'highlight' => true,
                    'analytics' => true,
                    'duration' => '30 Days',
                    'priorityListing' => true,
                    'branding' => true,
                    'socialPromo' => true,
                    'emailAlert' => true,
                    'support' => 'Priority',
                ]),
                'recommended' => true,
                'max_posts' => 10,
            ],
            [
                'plan_type' => 'employer',
                'name' => 'Premium',
                'price' => 199,
                'description' => 'Maximum reach with priority support.',
                'features' => json_encode([
                    'visibility' => true,
                    'highlight' => true,
                    'analytics' => true,
                    'duration' => '60 Days',
                    'priorityListing' => true,
                    'branding' => true,
                    'socialPromo' => true,
                    'emailAlert' => true,
                    'support' => 'Dedicated Manager',
                ]),
                'recommended' => false,
                'max_posts' => 20,
            ],
        ]);

    
    }
}

