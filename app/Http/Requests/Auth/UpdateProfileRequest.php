<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Deliberately excludes `email`, `accountType`, and `businessName` — a
     * customer can change their own contact details, not their identity or
     * plan, through this endpoint.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'firstName' => ['sometimes', 'required', 'string', 'max:100'],
            'lastName' => ['sometimes', 'required', 'string', 'max:100'],
            'phone' => ['sometimes', 'required', 'string', 'max:30'],
        ];
    }
}
