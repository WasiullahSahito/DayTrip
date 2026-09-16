<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttachPaymentMethodRequest extends FormRequest
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
            // A Stripe PaymentMethod ID (pm_...) produced client-side by Stripe.js
            // after the customer enters their card into Stripe's own Payment
            // Element. The raw card number/expiry/CVC never reach this API.
            'paymentMethodId' => ['required', 'string', 'starts_with:pm_'],
        ];
    }
}
