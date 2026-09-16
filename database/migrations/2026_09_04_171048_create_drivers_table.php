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
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->decimal('rating', 2, 1)->default(5.0);
            $table->string('reg')->unique(); // registration plate, e.g. "141-D-45231"
            $table->string('car');
            $table->string('color');
            $table->boolean('is_active')->default(true); // pool membership — off = excluded from random assignment
            $table->timestamps();

            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
