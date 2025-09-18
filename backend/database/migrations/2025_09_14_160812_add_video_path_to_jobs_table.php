<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            if (!Schema::hasColumn('jobs', 'image')) {
                $table->string('image')->nullable()->after('logo_path'); // banner image
            }
            if (!Schema::hasColumn('jobs', 'video_path')) {
                $table->string('video_path')->nullable()->after('image'); // uploaded video
            }
            if (Schema::hasColumn('jobs', 'video_url')) {
                $table->dropColumn('video_url'); // remove old URL column
            }
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropColumn(['image', 'video_path']);
            $table->string('video_url')->nullable(); // rollback
        });
    }
};
