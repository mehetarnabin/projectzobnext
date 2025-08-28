<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddInterviewDetailsToJobApplicationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->date('interview_date')->nullable()->after('status');
            $table->time('interview_time')->nullable()->after('interview_date');
            $table->string('interview_link', 2048)->nullable()->after('interview_time'); // For online links, or location/phone
            $table->string('interview_type')->nullable()->after('interview_link'); // 'online', 'in-person', 'phone'
            $table->json('interviewers')->nullable()->after('interview_type'); // Store as JSON array
            $table->text('interview_message')->nullable()->after('interviewers');
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
            $table->dropColumn([
                'interview_date',
                'interview_time',
                'interview_link',
                'interview_type',
                'interviewers',
                'interview_message',
            ]);
        });
    }
}