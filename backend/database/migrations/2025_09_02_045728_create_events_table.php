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
    Schema::create('events', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        
        $table->text('description')->nullable();

        // Store full start & end timestamps
        $table->dateTime('start_time');
        $table->dateTime('end_time')->nullable();

        $table->string('location')->nullable();
        $table->string('organizer')->nullable();

        // Status: upcoming, ongoing, completed
        $table->enum('category', ['upcoming', 'ongoing', 'completed'])->default('upcoming');

        // Media & tags
        $table->string('image_url')->nullable();
        ;

        

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
