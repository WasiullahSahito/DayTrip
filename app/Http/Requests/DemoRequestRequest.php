<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DemoRequestRequest extends FormRequest
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
            'companyName' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'businessType' => ['required', 'string', 'in:Corporate,Healthcare,Hospitality,Public Sector,Other'],
            'users' => ['nullable', 'string', 'max:20'],
            'message' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
