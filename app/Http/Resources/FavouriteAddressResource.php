<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\FavouriteAddress
 */
class FavouriteAddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'nickname' => $this->nickname,
            'label' => $this->label,
            'secondary' => $this->secondary,
            'lat' => (float) $this->lat,
            'lng' => (float) $this->lng,
            'isDefault' => $this->is_default,
        ];
    }
}
