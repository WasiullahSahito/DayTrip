<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Driver;
use App\Models\User;
use Illuminate\Support\Facades\Date;

class DashboardController extends Controller
{
    use ApiResponses;

    public function stats()
    {
        return $this->ok([
            'totalBookings' => Booking::count(),
            'bookingsByStatus' => Booking::selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status'),
            'activeDrivers' => Driver::where('is_active', true)->count(),
            'totalDrivers' => Driver::count(),
            'totalUsers' => User::count(),
            'revenueToday' => (float) Booking::whereDate('created_at', Date::today())
                ->whereIn('status', ['confirmed', 'completed'])
                ->sum('fare'),
        ]);
    }
}
