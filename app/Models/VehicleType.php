<?php

namespace App\Models;

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
     */
    public function calculateFare(float $distanceKm, int $durationMin): float
    {
        $raw = (float) $this->base_fare
            + $distanceKm * (float) $this->per_km
            + $durationMin * (float) $this->per_min;

        return round(max($raw, (float) $this->min_fare), 2);
    }
}
