<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDriverRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:150'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'rating' => ['sometimes', 'numeric', 'between:1,5'],
            'reg' => ['sometimes', 'string', 'max:20', Rule::unique('drivers', 'reg')->ignore($this->route('driver'))],
            'car' => ['sometimes', 'string', 'max:100'],
            'color' => ['sometimes', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
