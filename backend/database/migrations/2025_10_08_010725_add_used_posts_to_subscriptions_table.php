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
        Schema::table('subscriptions', function (Blueprint $table) {
            // Add used_posts if missing
            if (!Schema::hasColumn('subscriptions', 'used_posts')) {
                $table->integer('used_posts')->default(0)->after('status');
            }

            // Add notified_before_end if missing
            if (!Schema::hasColumn('subscriptions', 'notified_before_end')) {
                $table->boolean('notified_before_end')->default(false)->after('used_posts');
            }

            // Add status if missing
            if (!Schema::hasColumn('subscriptions', 'status')) {
                $table->enum('status', ['active', 'expired'])->default('active')->after('subscription_end_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('subscriptions', 'used_posts')) {
                $table->dropColumn('used_posts');
            }

            if (Schema::hasColumn('subscriptions', 'notified_before_end')) {
                $table->dropColumn('notified_before_end');
            }

            if (Schema::hasColumn('subscriptions', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
