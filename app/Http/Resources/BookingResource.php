<?php

namespace App\Http\Resources;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Booking
 */
class BookingResource extends JsonResource
{
    /**
     * Shaped to match the frontend's existing mock Booking object (epoch-ms
     * timestamps included) so the UI's own status-simulation logic keeps
     * working unmodified — `status`, `fare`, and `cancelled` below are the
     * real, server-authoritative values it now renders instead.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'reference' => $this->reference,
            'createdAt' => $this->created_at?->valueOf(),
            'scheduledFor' => $this->scheduled_for?->valueOf(),
            'isScheduled' => $this->is_scheduled,
            'pickup' => $this->pickup,
            'destination' => $this->destination,
            'stops' => $this->stops ?? [],
            'vehicle' => new VehicleTypeResource($this->whenLoaded('vehicleType')),
            'fare' => (float) $this->fare,
            'currency' => $this->currency,
            'distanceKm' => (float) $this->distance_km,
            'durationMin' => $this->duration_min,
            'passengers' => $this->passengers,
            'waitingMinutes' => $this->waiting_minutes,
            'passengerName' => $this->passenger_name,
            'phone' => $this->phone,
            'notes' => $this->notes ?? '',
            'flightNumber' => $this->flight_number ?? '',
            'confirmationEmail' => $this->confirmation_email ?? '',
            'returnJourney' => $this->return_journey,
            'paymentMethod' => ['type' => $this->payment_method],
            'driver' => $this->driver_snapshot,
            'status' => $this->status,
            'cancelled' => $this->status === 'cancelled',
            'cancelledAt' => $this->cancelled_at?->valueOf(),
            'tripDurationSec' => max(60, (int) round($this->duration_min * 60)),
        ];
    }
}
