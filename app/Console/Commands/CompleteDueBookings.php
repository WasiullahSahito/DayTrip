<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;

class CompleteDueBookings extends Command
{
    protected $signature = 'bookings:complete-due';

    protected $description = 'Marks confirmed, non-scheduled bookings as completed once their estimated trip duration has elapsed.';

    public function handle(): int
    {
        $due = Booking::where('status', 'confirmed')
            ->where('is_scheduled', false)
            ->get()
            ->filter(fn (Booking $booking) => now()->greaterThan($booking->created_at->addMinutes($booking->duration_min)));

        foreach ($due as $booking) {
            // `status` is deliberately excluded from Booking::$fillable, so
            // update(['status' => ...]) would silently no-op via fill() —
            // set the attribute directly instead, same as BookingService does.
            $booking->status = 'completed';
            $booking->save();
        }

        $this->info("Completed {$due->count()} booking(s).");

        return self::SUCCESS;
    }
}
