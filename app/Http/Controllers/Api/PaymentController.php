<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentIntentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Booking;
use App\Services\PaymentService;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;

class PaymentController extends Controller
{
    use ApiResponses;

    public function __construct(private PaymentService $payments) {}

    /**
     * The only inputs are `bookingId` and the caller's own identity — the
     * amount charged is whatever BookingService already calculated and
     * stored on the booking, in cents, from server-side distance/vehicle
     * data. Nothing here reads an amount from the request.
     */
    public function createIntent(PaymentIntentRequest $request)
    {
        $booking = Booking::findOrFail($request->validated('bookingId'));

        $this->authorize('pay', $booking);

        try {
            $result = $this->payments->createIntentForBooking($booking);
        } catch (ApiErrorException $e) {
            Log::error('Stripe PaymentIntent creation failed', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);

            return $this->fail('Unable to start payment right now. Please try again.', 502);
        }

        return $this->ok([
            'clientSecret' => $result['clientSecret'],
            'payment' => new PaymentResource($result['payment']),
        ]);
    }
}
