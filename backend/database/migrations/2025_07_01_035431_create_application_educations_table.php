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
        Schema::create('application_educations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained()->onDelete('cascade');
            $table->string('degree');
            $table->string('institution');
            $table->string('field_of_study')->nullable(); // Added for more detail
            $table->date('start_date')->nullable(); // Can be null if only year is known
            $table->date('end_date')->nullable(); // Nullable for ongoing education
            $table->string('grade')->nullable(); // e.g., GPA, percentage
            $table->boolean('honors')->default(false);
            $table->text('highlights')->nullable(); // Corresponds to 'details' in profile
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_educations');
    }
};
