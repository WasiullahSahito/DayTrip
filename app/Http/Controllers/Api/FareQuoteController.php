<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\FareQuoteRequest;
use App\Models\VehicleType;
use App\Services\BookingService;

class FareQuoteController extends Controller
{
    use ApiResponses;

    public function __construct(private BookingService $bookings) {}

    /**
     * Public endpoint (mirrors the site's Fare Estimator) — quotes every
     * active vehicle type for the given route, all computed server-side.
     */
    public function store(FareQuoteRequest $request)
    {
        $data = $request->validated();
        $route = $this->bookings->calculateRoute($data['pickup'], $data['destination']);

        $types = VehicleType::where('is_active', true)
            ->when(isset($data['vehicleTypeId']), fn ($q) => $q->where('key', $data['vehicleTypeId']))
            ->get();

        $quotes = $types->mapWithKeys(fn (VehicleType $type) => [
            $type->key => [
                'fare' => $this->bookings->quote($type, $route['distanceKm'], $route['durationMin']),
                'currency' => 'EUR',
                'distanceKm' => $route['distanceKm'],
                'durationMin' => $route['durationMin'],
            ],
        ]);

        return $this->ok($quotes);
    }
}
