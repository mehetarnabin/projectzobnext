<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use App\Models\Job;
use App\Models\Transaction;
use App\Models\SubscriptionPlan;

class StripeController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a PaymentIntent for a draft job
     */
    public function createPaymentIntent(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->isEmployer()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'job_id' => 'required|exists:jobs,id',
            'package_id' => 'required|exists:subscription_plans,id',
        ]);

        $package = SubscriptionPlan::findOrFail($validated['package_id']);

        $job = Job::where('id', $validated['job_id'])
                  ->where('employer_id', $user->id)
                  ->first();

        if (!$job) {
            return response()->json(['message' => 'Job not found or unauthorized.'], 404);
        }

        $intent = PaymentIntent::create([
            'amount' => $package->price * 100,
            'currency' => 'usd',
            'metadata' => [
                'user_id' => $user->id,
                'package_id' => $package->id,
                'job_id' => $job->id,
            ],
        ]);

        return response()->json([
            'clientSecret' => $intent->client_secret,
            'payment_intent_id' => $intent->id,
            'job_id' => $job->id,
        ]);
    }

    /**
     * Confirm payment and publish the job
     */
    public function confirmPayment(Request $request)
    {
        $validated = $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        try {
            $intent = PaymentIntent::retrieve($validated['payment_intent_id']);

            if ($intent->status === 'succeeded') {
                $jobId = $intent->metadata->job_id ?? null;

                if ($jobId) {
                    $job = Job::find($jobId);
                    if ($job && !$job->is_published) {
                        $job->update([
                            'is_published' => true,
                            'status' => 'published',
                        ]);
                    }

                    // Ensure transaction exists
                    Transaction::updateOrCreate(
                        ['stripe_payment_id' => $intent->id],
                        [
                            'user_id' => $intent->metadata->user_id ?? null,
                            'job_id' => $jobId,
                            'package_id' => $intent->metadata->package_id ?? null,
                            'amount' => $intent->amount / 100,
                            'currency' => $intent->currency,
                            'status' => 'succeeded',
                            'job_posted' => true,
                        ]
                    );
                }
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Stripe confirmPayment error: '.$e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Webhook handler for Stripe events (backup publishing)
     */
    public function handleWebhook(Request $request)
    {
        $payload = @file_get_contents('php://input');
        $sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Exception $e) {
            Log::error('Stripe webhook signature error: '.$e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }

        if ($event->type === 'payment_intent.succeeded') {
            $intent = $event->data->object;

            $jobId = $intent->metadata->job_id ?? null;
            if ($jobId) {
                $job = Job::find($jobId);
                if ($job && !$job->is_published) {
                    $job->update([
                        'is_published' => true,
                        'status' => 'published',
                    ]);
                }

                Transaction::updateOrCreate(
                    ['stripe_payment_id' => $intent->id],
                    [
                        'user_id' => $intent->metadata->user_id ?? null,
                        'job_id' => $jobId,
                        'package_id' => $intent->metadata->package_id ?? null,
                        'amount' => $intent->amount / 100,
                        'currency' => $intent->currency,
                        'status' => 'succeeded',
                        'job_posted' => true,
                    ]
                );
            }
        }

        return response()->json(['status' => 'success']);
    }
}
