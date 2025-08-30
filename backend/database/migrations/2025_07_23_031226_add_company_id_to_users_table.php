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
        Schema::table('users', function (Blueprint $table) {
            // Drop foreign key first if it exists from previous migrations or direct definitions
            // This is a safety measure if you had a foreign key on company_name which is unlikely
            // $table->dropForeign(['company_name']); // Uncomment if you had a FK on company_name

            // 1. Remove the old company_name column
            $table->dropColumn('company_name');

            // 2. Add the new company_id column, nullable initially to avoid issues if users exist
            //    and will be associated later, or if jobseekers don't need a company_id.
            $table->foreignId('company_id')->nullable()->after('role')->constrained()->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 1. Drop the foreign key constraint
            $table->dropForeign(['company_id']);
            $table->dropColumn('company_id');

            // 2. Re-add the company_name column if you are rolling back
            //    Make sure to match the original type and nullability
            $table->string('company_name')->nullable()->after('role');
        });
    }
};