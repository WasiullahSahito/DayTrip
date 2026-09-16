<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    /**
     * The entire IDOR defense for /api/bookings/{booking} and friends: a
     * booking belongs to exactly one user, and only that user (by primary
     * key match, never by trusting a client-supplied field) may act on it.
     */
    public function view(User $user, Booking $booking): bool
    {
        return $user->id === $booking->user_id;
    }

    public function cancel(User $user, Booking $booking): bool
    {
        return $user->id === $booking->user_id && $booking->isCancellable();
    }

    public function pay(User $user, Booking $booking): bool
    {
        return $user->id === $booking->user_id && $booking->isPayable();
    }
}
