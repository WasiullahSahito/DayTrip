<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFareSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gated by the route's `admin` middleware
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'base_fare' => ['sometimes', 'numeric', 'min:0', 'max:10000'],
            'per_km' => ['sometimes', 'numeric', 'min:0', 'max:1000'],
            'per_passenger' => ['sometimes', 'numeric', 'min:0', 'max:1000'],
            'waiting_per_minute' => ['sometimes', 'numeric', 'min:0', 'max:1000'],
        ];
    }
}
