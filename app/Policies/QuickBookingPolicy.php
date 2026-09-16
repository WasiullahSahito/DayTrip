<?php

namespace App\Policies;

use App\Models\QuickBooking;
use App\Models\User;

class QuickBookingPolicy
{
    public function delete(User $user, QuickBooking $quickBooking): bool
    {
        return $user->id === $quickBooking->user_id;
    }
}
