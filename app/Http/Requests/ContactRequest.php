<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'topic' => ['required', 'string', 'in:Booking Issue,General Query,Accounts and Payments'],
            'message' => ['required', 'string', 'min:5', 'max:300'],
        ];
    }
}
