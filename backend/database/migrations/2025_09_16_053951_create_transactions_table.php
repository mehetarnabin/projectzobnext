<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            
            // Relations
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('job_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('package_id')->nullable()->constrained('subscription_plans')->onDelete('set null');

            // Stripe data
            $table->string('stripe_payment_id')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default('usd');
            $table->enum('status', ['pending', 'succeeded', 'failed'])->default('pending');

            // Admin tracking
            $table->boolean('job_posted')->default(false);
            $table->boolean('refunded')->default(false);
            $table->string('user_ip', 45)->nullable();
            $table->text('admin_notes')->nullable();

            $table->timestamps();

            // Indexes for filtering
            $table->index(['status', 'refunded']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
