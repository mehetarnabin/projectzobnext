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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // jobseeker id
            $table->string('name');                // file name
            $table->string('path');                // storage path
            $table->string('category');            // Personal, Education, etc.
            $table->string('type');                // pdf, image, doc
            $table->string('size');                // e.g. "2.5MB"
            $table->date('date_uploaded');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
