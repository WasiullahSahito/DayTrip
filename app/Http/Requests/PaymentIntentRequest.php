<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentIntentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ownership of the booking itself is enforced via BookingPolicy::pay in the controller
    }

    /**
     * Deliberately the ONLY input this endpoint accepts. No amount, no
     * currency, no payment_status — PaymentService derives all of those
     * from the booking record itself.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'bookingId' => ['required', 'integer', 'exists:bookings,id'],
        ];
    }
}
