<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreDriverRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'rating' => ['nullable', 'numeric', 'between:1,5'],
            'reg' => ['required', 'string', 'max:20', 'unique:drivers,reg'],
            'car' => ['required', 'string', 'max:100'],
            'color' => ['required', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
