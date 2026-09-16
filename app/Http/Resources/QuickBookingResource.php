<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\QuickBooking
 */
class QuickBookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'label' => $this->label,
            'pickup' => $this->pickup,
            'destination' => $this->destination,
            'vehicle' => new VehicleTypeResource($this->whenLoaded('vehicleType')),
        ];
    }
}
