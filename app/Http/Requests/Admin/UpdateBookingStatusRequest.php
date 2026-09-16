<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingStatusRequest extends FormRequest
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
            'status' => ['required', 'string', 'in:pending_payment,confirmed,searching,driver_assigned,driver_en_route,driver_arrived,in_progress,completed,cancelled'],
        ];
    }
}
