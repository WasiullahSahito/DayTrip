<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AssignDriverRequest extends FormRequest
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
            'driverId' => ['required', 'integer', 'exists:drivers,id'],
        ];
    }
}
