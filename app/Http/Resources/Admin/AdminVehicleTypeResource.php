<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The full row, including rate fields the public VehicleTypeResource
 * deliberately omits — this is for the admin management UI only.
 *
 * @mixin \App\Models\VehicleType
 */
class AdminVehicleTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'name' => $this->name,
            'passengers' => $this->passengers,
            'icon' => $this->icon,
            'caption' => $this->caption,
            'baseFare' => (float) $this->base_fare,
            'perKm' => (float) $this->per_km,
            'perMin' => (float) $this->per_min,
            'minFare' => (float) $this->min_fare,
            'etaMins' => $this->eta_mins,
            'isActive' => $this->is_active,
        ];
    }
}
