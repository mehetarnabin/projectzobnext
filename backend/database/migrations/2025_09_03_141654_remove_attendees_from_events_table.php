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
        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'attendee_count')) {
                $table->dropColumn('attendee_count');
            }
            if (Schema::hasColumn('events', 'capacity')) {
                $table->dropColumn('capacity');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (!Schema::hasColumn('events', 'attendee_count')) {
                $table->integer('attendee_count')->default(0);
            }
            if (!Schema::hasColumn('events', 'capacity')) {
                $table->integer('capacity')->nullable();
            }
        });
    }
};
