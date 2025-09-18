<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropUnique('transactions_stripe_payment_id_unique'); // drop old unique index
            $table->string('stripe_payment_id')->nullable()->change();   // make column nullable
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('stripe_payment_id')->unique()->nullable(false)->change();
        });
    }
};
