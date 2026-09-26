<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FareQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public — mirrors the site's Fare Estimator, which requires no login
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'pickup.lat' => ['required', 'numeric', 'between:-90,90'],
            'pickup.lng' => ['required', 'numeric', 'between:-180,180'],
            'destination.lat' => ['required', 'numeric', 'between:-90,90'],
            'destination.lng' => ['required', 'numeric', 'between:-180,180'],
            'passengers' => ['nullable', 'integer', 'min:1', 'max:20'],
            'waitingMinutes' => ['nullable', 'integer', 'min:0', 'max:60'],
            'vehicleTypeId' => ['nullable', 'string', 'exists:vehicle_types,key'],
        ];
    }
}
