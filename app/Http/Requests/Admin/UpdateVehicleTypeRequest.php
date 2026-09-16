<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gated by the route's `admin` middleware, not a per-request policy
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'key' => ['sometimes', 'string', 'max:50', 'alpha_dash', Rule::unique('vehicle_types', 'key')->ignore($this->route('vehicleType'))],
            'name' => ['sometimes', 'string', 'max:100'],
            'passengers' => ['sometimes', 'integer', 'min:1', 'max:20'],
            'icon' => ['sometimes', 'nullable', 'string', 'max:50'],
            'caption' => ['sometimes', 'nullable', 'string', 'max:150'],
            'base_fare' => ['sometimes', 'numeric', 'min:0'],
            'per_km' => ['sometimes', 'numeric', 'min:0'],
            'per_min' => ['sometimes', 'numeric', 'min:0'],
            'min_fare' => ['sometimes', 'numeric', 'min:0'],
            'eta_mins' => ['sometimes', 'integer', 'min:1', 'max:60'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
