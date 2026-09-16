<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Payment
 */
class PaymentResource extends JsonResource
{
    /**
     * No card number, no CVC, no Stripe secret — just enough metadata for
     * the UI to reflect payment state. The amount is exposed as major units
     * (euro) for display; the integer minor-unit column is internal.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'bookingId' => (string) $this->booking_id,
            'amount' => $this->amount / 100,
            'currency' => strtoupper($this->currency),
            'paymentMethodType' => $this->payment_method_type,
            'status' => $this->status,
        ];
    }
}
