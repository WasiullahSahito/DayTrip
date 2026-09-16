<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\VehicleType
 */
class VehicleTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->key,
            'name' => $this->name,
            'passengers' => $this->passengers,
            'icon' => $this->icon,
            'caption' => $this->caption,
            'etaMins' => $this->eta_mins,
            'minFare' => (float) $this->min_fare,
        ];
    }
}
