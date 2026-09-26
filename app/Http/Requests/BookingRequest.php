<?php

namespace App\Http\Requests;

use App\Models\VehicleType;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class BookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // any authenticated user may create a booking for themselves
    }

    /**
     * Notably absent: fare, distanceKm, durationMin, status, driver, reference.
     * Those are never accepted from the client — BookingService computes and
     * assigns them from trusted server-side data only.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $point = function (string $prefix) {
            return [
                "$prefix.label" => ['required', 'string', 'max:255'],
                "$prefix.secondary" => ['nullable', 'string', 'max:255'],
                "$prefix.lat" => ['required', 'numeric', 'between:-90,90'],
                "$prefix.lng" => ['required', 'numeric', 'between:-180,180'],
            ];
        };

        return [
            'pickup' => ['required', 'array'],
            ...$point('pickup'),

            'destination' => ['required', 'array'],
            ...$point('destination'),

            'stops' => ['nullable', 'array', 'max:3'],
            'stops.*.label' => ['required', 'string', 'max:255'],
            'stops.*.secondary' => ['nullable', 'string', 'max:255'],
            'stops.*.lat' => ['required', 'numeric', 'between:-90,90'],
            'stops.*.lng' => ['required', 'numeric', 'between:-180,180'],

            'vehicleTypeId' => ['required', 'string', 'exists:vehicle_types,key'],
            'passengers' => ['nullable', 'integer', 'min:1', 'max:20'],
            'waitingMinutes' => ['nullable', 'integer', 'min:0', 'max:60'],

            'scheduledFor' => ['nullable', 'integer'], // epoch milliseconds, must be in the future
            'passengerName' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'notes' => ['nullable', 'string', 'max:300'],
            'flightNumber' => ['nullable', 'string', 'max:20'],
            'confirmationEmail' => ['nullable', 'email', 'max:255'],

            'returnJourney' => ['nullable', 'array'],
            'returnJourney.time' => ['required_with:returnJourney', 'date_format:H:i'],

            'paymentMethod' => ['required', 'array'],
            'paymentMethod.type' => ['required', 'string', 'in:cash,card'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            $vehicleType = VehicleType::where('key', $this->input('vehicleTypeId'))->first();
            $error = $vehicleType?->capacityError((int) ($this->input('passengers') ?? 1));

            if ($error) {
                $validator->errors()->add('passengers', $error);
            }
        }];
    }
}
