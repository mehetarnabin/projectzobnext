<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Transaction;
use App\Models\SubscriptionPlan;
use App\Models\Job;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class StripeController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create PaymentIntent for a job package.
     */
    public function createPaymentIntent(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->isEmployer()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'package_id' => 'required|exists:subscription_plans,id',
            'job_id'     => 'nullable|exists:jobs,id',
        ]);

        $package = SubscriptionPlan::findOrFail($validated['package_id']);

        $intent = PaymentIntent::create([
            'amount'   => $package->price * 100, // convert to cents
            'currency' => 'usd',
            'metadata' => [
                'user_id'    => $user->id,
                'package_id' => $package->id,
                'job_id'     => $validated['job_id'] ?? null,
            ],
        ]);

        return response()->json([
            'clientSecret' => $intent->client_secret, // ✅ use this in frontend
            'id'           => $intent->id,            // optional, for logs
        ]);
    }

    /**
     * Confirm Payment manually (optional, since confirm happens client-side).
     */
    public function confirmPayment(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->isEmployer()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'payment_intent_id' => 'required|string',
            'job_id'            => 'nullable|exists:jobs,id',
        ]);

        $intent = PaymentIntent::retrieve($request->payment_intent_id);

        if ($intent->status === 'succeeded') {
            $transaction = Transaction::updateOrCreate(
                ['stripe_payment_id' => $intent->id],
                [
                    'user_id'    => $user->id,
                    'job_id'     => $request->job_id ?? null,
                    'package_id' => $intent->metadata->package_id ?? null,
                    'amount'     => $intent->amount / 100,
                    'currency'   => $intent->currency,
                    'status'     => 'succeeded',
                ]
            );

            if ($request->job_id) {
                $job = Job::find($request->job_id);
                if ($job) {
                    $job->is_published = true;
                    $job->save();
                }
            }

            return response()->json([
                'message' => 'Payment confirmed.',
                'transaction' => $transaction,
            ]);
        }

        return response()->json(['message' => 'Payment not successful yet.'], 400);
    }

    /**
     * Handle Stripe Webhook events.
     */
    public function handleWebhook(Request $request)
    {
        $payload = @file_get_contents('php://input');
        $sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        if ($event->type === 'payment_intent.succeeded') {
            $intent = $event->data->object;

            Transaction::updateOrCreate(
                ['stripe_payment_id' => $intent->id],
                [
                    'user_id'    => $intent->metadata->user_id ?? null,
                    'job_id'     => $intent->metadata->job_id ?? null,
                    'package_id' => $intent->metadata->package_id ?? null,
                    'amount'     => $intent->amount / 100,
                    'currency'   => $intent->currency,
                    'status'     => 'succeeded',
                ]
            );

            if (!empty($intent->metadata->job_id)) {
                $job = Job::find($intent->metadata->job_id);
                if ($job) {
                    $job->is_published = true;
                    $job->save();
                }
            }
        }

        return response()->json(['status' => 'success']);
    }

        public function confirmFreePackage(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->isEmployer()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'job_id' => 'required|exists:jobs,id',
            'package_id' => 'required|exists:subscription_plans,id',
        ]);

        $job = Job::findOrFail($request->job_id);
        $job->is_published = true;
        $job->save();

        // Record transaction with amount = 0
        \App\Models\Transaction::create([
            'user_id' => $user->id,
            'job_id' => $job->id,
            'package_id' => $request->package_id,
            'amount' => 0,
            'currency' => 'usd',
            'status' => 'succeeded',
            'stripe_payment_id' => null,
        ]);

        return response()->json(['message' => 'Free package applied successfully.']);
    }

}
