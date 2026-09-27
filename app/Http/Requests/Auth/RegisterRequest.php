<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
        return [
            'firstName' => ['required', 'string', 'max:100'],
            'lastName' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            // Optional: the quick booking signup lets a new user skip setting
            // a password and add one later via the existing password-reset
            // email flow. Omitted entirely means no key is sent at all — see
            // frontend/src/services/authService.js.
            'password' => ['nullable', 'string', 'confirmed', Password::min(8)->letters()->numbers()],
            'phone' => ['required', 'string', 'max:30'],
            // Self-service plan choice, not a security role — see App\Models\User docblock.
            'accountType' => ['required', 'string', 'in:personal,business,business-plus'],
            'businessName' => ['required_unless:accountType,personal', 'nullable', 'string', 'max:255'],
        ];
    }
}
