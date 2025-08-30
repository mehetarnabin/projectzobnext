<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // For data migration if needed

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('companies', function (Blueprint $table) {
            // Add new columns if they don't exist
            if (!Schema::hasColumn('companies', 'logo_url')) {
                $table->string('logo_url')->nullable()->after('name'); // Or wherever you want it
            }
            if (!Schema::hasColumn('companies', 'banner_url')) {
                $table->string('banner_url')->nullable()->after('logo_url'); // Or wherever you want it
            }
        });

        // Optional: Migrate existing data from profiles table to companies table
        // This part assumes a relationship where a profile (of an employer) has a company_id
        // or that the logo/banner was previously stored directly on the profile linked to an employer user.
        // You need to adjust this logic based on your actual data structure.

        // Example if profiles has logo/banner and a company_id:
        // DB::table('profiles')
        //     ->whereNotNull('company_id')
        //     ->where(function ($query) {
        //         $query->whereNotNull('logo_url')->orWhereNotNull('banner_url');
        //     })
        //     ->each(function ($profile) {
        //         if ($profile->company_id) {
        //             DB::table('companies')
        //                 ->where('id', $profile->company_id)
        //                 ->update([
        //                     'logo_url' => $profile->logo_url,
        //                     'banner_url' => $profile->banner_url,
        //                     'updated_at' => now(),
        //                 ]);
        //         }
        //     });

        // After migrating, you might remove them from the 'profiles' table if they are no longer needed there.
        // Schema::table('profiles', function (Blueprint $table) {
        //     $table->dropColumn(['logo_url', 'banner_url']);
        // });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['logo_url', 'banner_url']);
        });

        // If you removed columns from profiles in up(), you might add them back here
        // Schema::table('profiles', function (Blueprint $table) {
        //     $table->string('logo_url')->nullable();
        //     $table->string('banner_url')->nullable();
        // });
    }
};