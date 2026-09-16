<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\BookingResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Composes the existing customer-facing BookingResource rather than
 * duplicating its ~20 fields, then layers on the admin-only bits (which
 * user the booking belongs to, and the real driver_id link).
 *
 * @mixin \App\Models\Booking
 */
class AdminBookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return array_merge(
            (new BookingResource($this->resource))->toArray($request),
            [
                'driverId' => $this->driver_id,
                'user' => [
                    'id' => (string) $this->user_id,
                    'name' => trim("{$this->user->first_name} {$this->user->last_name}"),
                    'email' => $this->user->email,
                ],
            ]
        );
    }
}
