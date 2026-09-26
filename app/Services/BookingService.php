<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Driver;
use App\Models\User;
use App\Models\VehicleType;
use App\Notifications\BookingConfirmed;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingService
{
    /**
     * Great-circle distance in km — the same formula the frontend uses for
     * its live preview, so estimates line up, but this is the copy that
     * actually determines the fare that gets charged.
     */
    public function distanceKm(array $a, array $b): float
    {
        $earthRadiusKm = 6371;
        $dLat = deg2rad($b['lat'] - $a['lat']);
        $dLng = deg2rad($b['lng'] - $a['lng']);
        $lat1 = deg2rad($a['lat']);
        $lat2 = deg2rad($b['lat']);

        $h = sin($dLat / 2) ** 2 + sin($dLng / 2) ** 2 * cos($lat1) * cos($lat2);

        return $earthRadiusKm * 2 * asin(sqrt($h));
    }

    /**
     * Total route distance/duration across pickup -> stops -> destination,
     * with the same straight-line-to-road padding the frontend applies.
     *
     * @return array{distanceKm: float, durationMin: int}
     */
    public function calculateRoute(array $pickup, array $destination, array $stops = []): array
    {
        $points = [$pickup, ...$stops, $destination];
        $rawKm = 0.0;
        for ($i = 0; $i < count($points) - 1; $i++) {
            $rawKm += $this->distanceKm($points[$i], $points[$i + 1]);
        }

        $distanceKm = round($rawKm * 1.35, 2);
        $durationMin = (int) round(($distanceKm / 28) * 60 + count($stops) * 3);

        return ['distanceKm' => $distanceKm, 'durationMin' => max(1, $durationMin)];
    }

    public function quote(float $distanceKm, int $passengers = 1, int $waitingMinutes = 0): float
    {
        return VehicleType::calculateFare($distanceKm, $passengers, $waitingMinutes);
    }

    /**
     * Creates the booking and, for cash bookings, confirms it immediately
     * (there's no card payment to wait on). Card bookings stay
     * `pending_payment` until PaymentService confirms a successful charge.
     */
    public function create(User $user, VehicleType $vehicleType, array $data): Booking
    {
        return DB::transaction(function () use ($user, $vehicleType, $data) {
            $route = $this->calculateRoute($data['pickup'], $data['destination'], $data['stops'] ?? []);
            $passengers = (int) ($data['passengers'] ?? 1);
            $waitingMinutes = min((int) ($data['waitingMinutes'] ?? 0), (int) config('fare.max_waiting_minutes'));
            $fare = $this->quote($route['distanceKm'], $passengers, $waitingMinutes);

            $scheduledFor = isset($data['scheduledFor'])
                ? Carbon::createFromTimestampMs($data['scheduledFor'])
                : null;
            $isScheduled = $scheduledFor !== null && $scheduledFor->isAfter(now()->addMinutes(5));

            $paymentMethodType = $data['paymentMethod']['type'];

            $booking = new Booking([
                'vehicle_type_id' => $vehicleType->id,
                'pickup' => $data['pickup'],
                'destination' => $data['destination'],
                'stops' => $data['stops'] ?? [],
                'distance_km' => $route['distanceKm'],
                'duration_min' => $route['durationMin'],
                'passengers' => $passengers,
                'waiting_minutes' => $waitingMinutes,
                'currency' => 'EUR',
                'passenger_name' => $data['passengerName'],
                'phone' => $data['phone'],
                'notes' => $data['notes'] ?? null,
                'flight_number' => $data['flightNumber'] ?? null,
                'confirmation_email' => $data['confirmationEmail'] ?? null,
                'return_journey' => $data['returnJourney'] ?? null,
                'payment_method' => $paymentMethodType,
                'scheduled_for' => $scheduledFor,
                'is_scheduled' => $isScheduled,
                'idempotency_key' => $data['idempotencyKey'] ?? null,
            ]);

            $booking->user_id = $user->id;
            $booking->fare = $fare;
            $booking->reference = $this->generateUniqueReference();
            $booking->status = $paymentMethodType === 'card' ? 'pending_payment' : 'confirmed';

            if (! $isScheduled && $paymentMethodType !== 'card') {
                $this->assignDriverSnapshot($booking, Driver::where('is_active', true)->inRandomOrder()->first());
            }

            $booking->save();

            if ($booking->status === 'confirmed') {
                $this->sendConfirmation($booking);
            }

            return $booking->fresh(['vehicleType']);
        });
    }

    public function cancel(Booking $booking): Booking
    {
        $booking->status = 'cancelled';
        $booking->cancelled_at = now();
        $booking->save();

        return $booking->fresh(['vehicleType']);
    }

    /**
     * Called once a booking is actually confirmed — immediately for cash,
     * or from the Stripe webhook once a card payment succeeds. Queued so a
     * slow SMTP server never holds up the booking response.
     */
    public function sendConfirmation(Booking $booking): void
    {
        if (! $booking->driver_snapshot && ! $booking->is_scheduled) {
            $this->assignDriverSnapshot($booking, Driver::where('is_active', true)->inRandomOrder()->first());
            $booking->saveQuietly();
        }

        $booking->user->notify(new BookingConfirmed($booking));
    }

    /**
     * Admin-initiated reassignment (unlike the private helper below, this
     * persists immediately since it's always called on an already-saved
     * booking).
     */
    public function assignDriver(Booking $booking, Driver $driver): Booking
    {
        $this->assignDriverSnapshot($booking, $driver);
        $booking->save();

        return $booking->fresh(['vehicleType', 'driver']);
    }

    /**
     * Admin override — can set any status at any time, deliberately
     * bypassing Booking::CANCELLABLE_STATUSES (that constant only gates the
     * customer-facing cancel endpoint).
     */
    public function updateStatus(Booking $booking, string $status): Booking
    {
        $booking->status = $status;
        if ($status === 'cancelled' && ! $booking->cancelled_at) {
            $booking->cancelled_at = now();
        }
        $booking->save();

        return $booking->fresh(['vehicleType', 'driver']);
    }

    /**
     * The one place Booking::driver_id/driver_snapshot are ever set, shared
     * by automatic random-pick assignment (create()/sendConfirmation()) and
     * admin-manual assignment (assignDriver()) so both paths always produce
     * an identically-shaped snapshot. No-op if $driver is null — a graceful
     * demo-scale fallback for when no active drivers are seeded, not an error.
     */
    private function assignDriverSnapshot(Booking $booking, ?Driver $driver): void
    {
        if (! $driver) {
            return;
        }

        $booking->driver_id = $driver->id;
        $booking->driver_snapshot = $driver->toSnapshot();
    }

    private function generateUniqueReference(): string
    {
        do {
            $reference = 'LX'.strtoupper(Str::random(6));
        } while (Booking::where('reference', $reference)->exists());

        return $reference;
    }
}
