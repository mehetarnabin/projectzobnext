<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->enum('plan_type', ['employer', 'jobseeker']); // Employer or Jobseeker
            $table->string('name');
            $table->decimal('price', 8, 2)->default(0);
            $table->text('description')->nullable();
            $table->json('features')->nullable(); // Store all features in JSON
            $table->boolean('recommended')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
