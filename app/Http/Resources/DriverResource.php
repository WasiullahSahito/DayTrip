<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Driver
 */
class DriverResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'rating' => (float) $this->rating,
            'reg' => $this->reg,
            'car' => $this->car,
            'color' => $this->color,
            'isActive' => $this->is_active,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
