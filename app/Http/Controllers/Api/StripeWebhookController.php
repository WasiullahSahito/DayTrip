<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use UnexpectedValueException;

/**
 * No auth middleware — Stripe calls this directly, so the signature check
 * below is the entire trust boundary. A request without a valid signature
 * for STRIPE_WEBHOOK_SECRET is rejected outright; nothing it claims about
 * a payment is acted on otherwise.
 */
class StripeWebhookController extends Controller
{
    use ApiResponses;

    public function __construct(private PaymentService $payments) {}

    public function handle(Request $request)
    {
        $signature = $request->header('Stripe-Signature', '');

        try {
            $event = $this->payments->constructWebhookEvent($request->getContent(), $signature);
        } catch (UnexpectedValueException|SignatureVerificationException $e) {
            Log::warning('Rejected Stripe webhook with invalid payload/signature', ['error' => $e->getMessage()]);

            return $this->fail('Invalid signature.', 400);
        }

        $this->payments->handleWebhookEvent($event);

        return $this->ok(null, 'ok');
    }
}
