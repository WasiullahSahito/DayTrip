<?php

namespace App\Models;

use App\Services\FareSettings;
use Illuminate\Database\Eloquent\Model;

class VehicleType extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'base_fare' => 'decimal:2',
            'per_km' => 'decimal:2',
            'per_min' => 'decimal:2',
            'min_fare' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Server-authoritative fare calculation — the only place a fare is ever
     * derived from. Never trust a fare/amount value submitted by a client.
     *
     * Fare = base_fare + per_km x km + per_passenger x passengers + waiting
     * charge, with waiting billed per minute and capped at one hour (rates: FareSettings).
     * Independent of the vehicle type's own rate columns.
     */
    public static function calculateFare(float $distanceKm, int $passengers, int $waitingMinutes = 0): float
    {
        $rates = app(FareSettings::class)->all();
        $waiting = min(max($waitingMinutes, 0), $rates['max_waiting_minutes']);

        $fare = $rates['base_fare']
            + $distanceKm * $rates['per_km']
            + max($passengers, 1) * $rates['per_passenger']
            + $rates['waiting_per_minute'] * $waiting;

        return round($fare, 2);
    }

    public function fitsPassengers(int $passengers): bool
    {
        return $passengers <= $this->passengers;
    }

    /**
     * Reason a party is too big for this vehicle, naming the smallest active
     * vehicle that would fit — or null if it fits.
     */
    public function capacityError(int $passengers): ?string
    {
        if ($this->fitsPassengers($passengers)) {
            return null;
        }

        $suggested = static::where('is_active', true)
            ->where('passengers', '>=', $passengers)
            ->orderBy('passengers')
            ->first();

        $message = "{$this->name} seats {$this->passengers}, but you entered {$passengers} passengers.";

        return $suggested
            ? "{$message} Please select a {$suggested->name} ({$suggested->passengers} seater) vehicle to book."
            : "{$message} We have no vehicle that seats {$passengers} passengers.";
    }
}
