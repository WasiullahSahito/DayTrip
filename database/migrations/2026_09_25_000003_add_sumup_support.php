<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('sumup_customer_id')->nullable()->unique();
            $table->string('sumup_default_token')->nullable();
            // Which provider's default card is *the* default when the user
            // has saved cards with both Stripe and SumUp.
            $table->string('default_card_provider', 20)->nullable();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->string('provider', 20)->default('stripe')->after('user_id');
            $table->string('sumup_checkout_id')->nullable()->unique()->after('stripe_payment_intent_id');
            $table->string('stripe_payment_intent_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique(['sumup_checkout_id']);
            $table->dropColumn(['provider', 'sumup_checkout_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['sumup_customer_id']);
            $table->dropColumn(['sumup_customer_id', 'sumup_default_token', 'default_card_provider']);
        });
    }
};
