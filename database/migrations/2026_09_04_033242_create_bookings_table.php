<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 16)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vehicle_type_id')->constrained();

            $table->jsonb('pickup'); // {label, secondary, lat, lng}
            $table->jsonb('destination');
            $table->jsonb('stops')->nullable();

            $table->decimal('distance_km', 8, 2);
            $table->unsignedInteger('duration_min');
            $table->decimal('fare', 10, 2);
            $table->char('currency', 3)->default('EUR');

            $table->string('passenger_name');
            $table->string('phone');
            $table->string('notes', 300)->nullable();
            $table->string('flight_number', 20)->nullable();
            $table->string('confirmation_email')->nullable();
            $table->jsonb('return_journey')->nullable();
            $table->jsonb('driver_snapshot')->nullable();

            $table->string('payment_method'); // cash | card
            $table->string('status')->default('pending_payment');
            // pending_payment | confirmed | searching | driver_assigned | driver_en_route
            // | driver_arrived | in_progress | completed | cancelled

            $table->timestamp('scheduled_for')->nullable();
            $table->boolean('is_scheduled')->default(false);
            $table->timestamp('cancelled_at')->nullable();
            $table->string('idempotency_key')->nullable()->unique();

            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
