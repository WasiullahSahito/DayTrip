<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SumUpChargeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // booking ownership is enforced via BookingPolicy::pay in the controller
    }

    /**
     * Only the booking and which saved card — never an amount; the fare is
     * read from the stored booking.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'bookingId' => ['required', 'integer', 'exists:bookings,id'],
            'cardId' => ['required', 'string', 'starts_with:sumup:'],
        ];
    }
}
