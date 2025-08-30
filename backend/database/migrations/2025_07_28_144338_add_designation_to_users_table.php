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
            // Add a string column for 'designation'. This will store the user's role within a company.
            // It's nullable as job seekers won't have a designation, and employers might not set it immediately.
            // Ensure this column does not already exist before adding.
            if (!Schema::hasColumn('users', 'designation')) {
                $table->string('designation')->nullable()->after('role');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the 'designation' column if rolling back the migration.
            if (Schema::hasColumn('users', 'designation')) {
                $table->dropColumn('designation');
            }
        });
    }
};