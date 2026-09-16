<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuickBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $point = fn (string $prefix) => [
            "$prefix.label" => ['required', 'string', 'max:255'],
            "$prefix.secondary" => ['nullable', 'string', 'max:255'],
            "$prefix.lat" => ['required', 'numeric', 'between:-90,90'],
            "$prefix.lng" => ['required', 'numeric', 'between:-180,180'],
        ];

        return [
            'label' => ['required', 'string', 'max:150'],
            'vehicleTypeId' => ['required', 'string', 'exists:vehicle_types,key'],
            'pickup' => ['required', 'array'],
            ...$point('pickup'),
            'destination' => ['required', 'array'],
            ...$point('destination'),
        ];
    }
}
