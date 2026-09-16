<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained();
            $table->string('stripe_payment_intent_id')->unique();
            // amount is the authoritative, server-calculated total in the smallest
            // currency unit (cents) — never derived from client input at charge time.
            $table->unsignedBigInteger('amount');
            $table->char('currency', 3)->default('eur');
            $table->string('payment_method_type')->nullable(); // card, etc. (from Stripe)
            $table->string('status'); // requires_payment_method | requires_action | processing | succeeded | canceled | failed
            $table->timestamps();

            $table->index(['booking_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
