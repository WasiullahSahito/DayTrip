<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\AttachPaymentMethodRequest;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Stripe\Exception\ApiErrorException;

/**
 * Real Stripe PaymentMethods, scoped to the caller's own Stripe Customer.
 * The raw card number/expiry/CVC is entered directly into Stripe's Payment
 * Element in the browser and never transits this API — only the resulting
 * Stripe PaymentMethod ID (pm_...) does.
 */
class PaymentMethodController extends Controller
{
    use ApiResponses;

    public function __construct(private PaymentService $payments) {}

    public function index(Request $request)
    {
        return $this->ok($this->payments->listPaymentMethods($request->user()));
    }

    public function setupIntent(Request $request)
    {
        try {
            $clientSecret = $this->payments->createSetupIntent($request->user());
        } catch (ApiErrorException $e) {
            return $this->fail('Unable to start card setup right now. Please try again.', 502);
        }

        return $this->ok(['clientSecret' => $clientSecret]);
    }

    public function store(AttachPaymentMethodRequest $request)
    {
        try {
            $this->payments->attachPaymentMethod($request->user(), $request->validated('paymentMethodId'));
        } catch (ApiErrorException $e) {
            return $this->fail('Unable to save this card. Please try again.', 502);
        }

        return $this->created($this->payments->listPaymentMethods($request->user()), 'Card added.');
    }

    public function destroy(Request $request, string $paymentMethod)
    {
        $this->payments->detachPaymentMethod($request->user(), $paymentMethod);

        return $this->ok($this->payments->listPaymentMethods($request->user()), 'Card removed.');
    }

    public function setDefault(Request $request, string $paymentMethod)
    {
        $this->payments->setDefaultPaymentMethod($request->user(), $paymentMethod);

        return $this->ok($this->payments->listPaymentMethods($request->user()), 'Default payment method updated.');
    }
}
