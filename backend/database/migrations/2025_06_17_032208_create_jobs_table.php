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
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employer_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('location');
            $table->string('classification');
            $table->enum('work_type', ['Full Time', 'Part Time', 'Contract', 'Internship']);
            $table->enum('workplace', ['On-site', 'Hybrid', 'Remote']);
            $table->string('salary');
            $table->string('salary_type');
            $table->string('company');
            $table->string('logo_path')->nullable();
            $table->date('apply_before');
            $table->string('video_url')->nullable();
            $table->json('key_points')->nullable();
            $table->string('package');
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
