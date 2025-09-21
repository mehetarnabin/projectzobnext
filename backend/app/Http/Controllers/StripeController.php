<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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

    public function createPaymentIntent(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->isEmployer()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'package_id' => 'required|exists:subscription_plans,id',
            'job_id' => 'nullable|exists:jobs,id',
        ]);

        $package = SubscriptionPlan::findOrFail($validated['package_id']);

        $intent = PaymentIntent::create([
            'amount' => $package->price * 100,
            'currency' => 'usd',
            'metadata' => [
                'user_id' => $user->id,
                'package_id' => $package->id,
                'job_id' => $validated['job_id'] ?? null,
            ],
        ]);

        return response()->json([
            'clientSecret' => $intent->client_secret,
            'id' => $intent->id,
        ]);
    }

    public function confirmPayment(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->isEmployer()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'payment_intent_id' => 'required|string',
            'job_id' => 'nullable|exists:jobs,id',
        ]);

        try {
            $intent = PaymentIntent::retrieve($request->payment_intent_id);

            if ($intent->status !== 'succeeded') {
                return response()->json(['message' => 'Payment not successful yet.'], 400);
            }

            $jobId = $request->job_id ?? $intent->metadata->job_id ?? null;

            $transaction = Transaction::updateOrCreate(
                ['stripe_payment_id' => $intent->id],
                [
                    'user_id' => $user->id,
                    'job_id' => $jobId,
                    'package_id' => $intent->metadata->package_id ?? null,
                    'amount' => $intent->amount / 100,
                    'currency' => $intent->currency,
                    'status' => 'succeeded',
                    'job_posted' => !empty($jobId),
                ]
            );

            if ($jobId) {
                $job = Job::where('id', $jobId)->where('employer_id', $user->id)->first();
                if ($job) {
                    $job->is_published = true;
                    $job->save();
                }
            }

            return response()->json([
                'message' => 'Payment confirmed successfully.',
                'transaction' => $transaction,
            ]);

        } catch (\Exception $e) {
            Log::error('Error confirming payment:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to confirm payment.'], 500);
        }
    }

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
            $jobId = $intent->metadata->job_id ?? null;

            Transaction::updateOrCreate(
                ['stripe_payment_id' => $intent->id],
                [
                    'user_id' => $intent->metadata->user_id ?? null,
                    'job_id' => $jobId,
                    'package_id' => $intent->metadata->package_id ?? null,
                    'amount' => $intent->amount / 100,
                    'currency' => $intent->currency,
                    'status' => 'succeeded',
                    'job_posted' => !empty($jobId),
                ]
            );

            if ($jobId) {
                $job = Job::find($jobId);
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

        $validated = $request->validate([
            'job_id' => 'required|exists:jobs,id',
            'package_id' => 'required|exists:subscription_plans,id',
        ]);

        $job = Job::where('id', $validated['job_id'])
                  ->where('employer_id', $user->id)
                  ->firstOrFail();

        $job->is_published = true;
        $job->save();

        Transaction::create([
            'user_id' => $user->id,
            'job_id' => $job->id,
            'package_id' => $validated['package_id'],
            'amount' => 0,
            'currency' => 'usd',
            'status' => 'succeeded',
            'stripe_payment_id' => null,
            'job_posted' => true,
        ]);

        return response()->json(['message' => 'Free package applied successfully.'], 200);
    }
}
