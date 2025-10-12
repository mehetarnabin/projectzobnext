<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Set default to true
        Schema::table('jobs', function (Blueprint $table) {
            $table->boolean('is_published')->default(true)->change();
        });

        // Update existing rows to true
        \App\Models\Job::query()->update(['is_published' => true]);
    }

    public function down(): void
    {
        // Revert default to false
        Schema::table('jobs', function (Blueprint $table) {
            $table->boolean('is_published')->default(false)->change();
        });
    }
};
