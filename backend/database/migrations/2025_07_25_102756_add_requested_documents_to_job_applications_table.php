<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('job_applications', function (Blueprint $table) {
            // Add a JSON column to store requested documents.
            // This will store an array of objects like:
            // [{ type: 'Portfolio', message: 'Please upload...', status: 'pending', url: null }, ...]
            if (!Schema::hasColumn('job_applications', 'requested_documents')) {
                $table->json('requested_documents')->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn('requested_documents');
        });
    }
};

