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
        Schema::table('bookings', function (Blueprint $table) {
            // driver_snapshot (existing jsonb column) stays the point-in-time
            // display copy; this FK is the queryable/admin-facing link on
            // top of it — nullOnDelete so removing a driver never breaks a
            // past booking's already-stored snapshot.
            $table->foreignId('driver_id')->nullable()->after('vehicle_type_id')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('driver_id');
        });
    }
};
