<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleTypeRequest extends FormRequest
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
            'key' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:vehicle_types,key'],
            'name' => ['required', 'string', 'max:100'],
            'passengers' => ['required', 'integer', 'min:1', 'max:20'],
            'icon' => ['nullable', 'string', 'max:50'],
            'caption' => ['nullable', 'string', 'max:150'],
            'base_fare' => ['required', 'numeric', 'min:0'],
            'per_km' => ['required', 'numeric', 'min:0'],
            'per_min' => ['required', 'numeric', 'min:0'],
            'min_fare' => ['required', 'numeric', 'min:0'],
            'eta_mins' => ['nullable', 'integer', 'min:1', 'max:60'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
