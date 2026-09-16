<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_types', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // saloon | six-seater | seven-seater | eight-seater | wheelchair
            $table->string('name');
            $table->unsignedTinyInteger('passengers');
            $table->string('icon')->nullable();
            $table->string('caption')->nullable();
            $table->decimal('base_fare', 8, 2);
            $table->decimal('per_km', 8, 2);
            $table->decimal('per_min', 8, 2);
            $table->decimal('min_fare', 8, 2);
            $table->unsignedSmallInteger('eta_mins')->default(5);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_types');
    }
};
