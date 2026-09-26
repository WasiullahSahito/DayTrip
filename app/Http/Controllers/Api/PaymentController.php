<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentIntentRequest;
use App\Http\Requests\SumUpChargeRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Booking;
use App\Services\PaymentService;
use App\Services\SumUpService;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class PaymentController extends Controller
{
    use ApiResponses;

    public function __construct(private PaymentService $payments, private SumUpService $sumup) {}

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

    /**
     * Pays a booking with one of the caller's saved SumUp cards. As with
     * Stripe, the amount is the fare already stored on the booking; the
     * card must be one of the caller's own (checked in SumUpService).
     */
    public function chargeSumUp(SumUpChargeRequest $request)
    {
        $booking = Booking::findOrFail($request->validated('bookingId'));

        $this->authorize('pay', $booking);

        if (! $this->sumup->isConfigured()) {
            return $this->fail('SumUp card payments are not configured yet.', 503);
        }

        try {
            $paid = $this->sumup->chargeBooking($booking, $request->validated('cardId'));
        } catch (HttpExceptionInterface $e) {
            throw $e;
        } catch (\Throwable $e) {
            report($e);

            return $this->fail('Unable to process the payment right now. Please try again.', 502);
        }

        if (! $paid) {
            return $this->fail('Your card was declined. Please try another card.', 402);
        }

        return $this->ok(['status' => 'succeeded']);
    }
}
