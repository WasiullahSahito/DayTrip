<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\User
 */
class UserResource extends JsonResource
{
    /**
     * Field names match the frontend's existing mock User shape exactly, so
     * no page/component needed to change when swapping the mock service for
     * a real API call. Password, remember_token, and stripe_customer_id are
     * never included — they aren't just hidden by the model cast, they're
     * simply not referenced here.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'email' => $this->email,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'phone' => $this->phone,
            'accountType' => $this->account_type,
            'businessName' => $this->business_name,
            'isAdmin' => (bool) $this->is_admin,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
