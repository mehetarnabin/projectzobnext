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
        Schema::table('companies', function (Blueprint $table) {
            // Add a JSON column for 'badges'. This will store an array of badge URLs/data.
            // It's nullable as not all companies might have badges initially.
            $table->json('badges')->nullable()->after('banner_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            // Drop the 'badges' column if rolling back the migration.
            $table->dropColumn('badges');
        });
    }
};