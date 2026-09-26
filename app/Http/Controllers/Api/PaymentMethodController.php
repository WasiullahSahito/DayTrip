<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\AttachPaymentMethodRequest;
use App\Models\User;
use App\Services\PaymentService;
use App\Services\SumUpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

/**
 * A user's saved cards across both providers. Stripe cards are real Stripe
 * PaymentMethods (scoped to the caller's Stripe Customer) and SumUp cards
 * are SumUp payment instruments (scoped to the caller's SumUp customer);
 * raw card numbers never transit this API for either. SumUp ids are
 * "sumup:<token>", Stripe ids are pm_....
 */
class PaymentMethodController extends Controller
{
    use ApiResponses;

    public function __construct(private PaymentService $payments, private SumUpService $sumup) {}

    public function index(Request $request)
    {
        return $this->ok($this->allCards($request->user()));
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

        return $this->created($this->allCards($request->user()), 'Card added.');
    }

    /**
     * Starts saving a SumUp card: returns the checkout id the SumUp Card
     * Widget mounts against in the browser.
     */
    public function sumupCheckout(Request $request)
    {
        if (! $this->sumup->isConfigured()) {
            return $this->fail('SumUp card payments are not configured yet.', 503);
        }

        try {
            $checkoutId = $this->sumup->createSetupCheckout($request->user());
        } catch (Throwable $e) {
            report($e);

            return $this->fail('Unable to start card setup right now. Please try again.', 502);
        }

        return $this->ok(['checkoutId' => $checkoutId]);
    }

    public function sumupConfirm(Request $request)
    {
        $checkoutId = $request->validate(['checkoutId' => ['required', 'string', 'max:100']])['checkoutId'];

        try {
            $this->sumup->confirmSetup($request->user(), $checkoutId);
        } catch (Throwable $e) {
            if ($e instanceof HttpExceptionInterface) {
                throw $e;
            }
            report($e);

            return $this->fail('Unable to save this card. Please try again.', 502);
        }

        return $this->created($this->allCards($request->user()), 'Card added.');
    }

    public function destroy(Request $request, string $paymentMethod)
    {
        if (SumUpService::isSumUpCardId($paymentMethod)) {
            try {
                $this->sumup->removeCard($request->user(), $paymentMethod);
            } catch (Throwable $e) {
                if ($e instanceof HttpExceptionInterface) {
                    throw $e;
                }
                report($e);

                return $this->fail('Unable to remove this card. Please try again.', 502);
            }
        } else {
            $this->payments->detachPaymentMethod($request->user(), $paymentMethod);
        }

        return $this->ok($this->allCards($request->user()), 'Card removed.');
    }

    public function setDefault(Request $request, string $paymentMethod)
    {
        $user = $request->user();

        if (SumUpService::isSumUpCardId($paymentMethod)) {
            $this->sumup->setDefault($user, $paymentMethod);
        } else {
            $this->payments->setDefaultPaymentMethod($user, $paymentMethod);
            $user->forceFill(['default_card_provider' => 'stripe'])->saveQuietly();
        }

        return $this->ok($this->allCards($user->refresh()), 'Default payment method updated.');
    }

    /**
     * Stripe + SumUp cards in one list with a single default. A SumUp outage
     * degrades to "no SumUp cards" instead of hiding the Stripe ones.
     *
     * @return array<int, array<string, mixed>>
     */
    private function allCards(User $user): array
    {
        try {
            $sumupCards = $this->sumup->listCards($user);
        } catch (Throwable $e) {
            Log::warning('Could not load SumUp cards', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            $sumupCards = [];
        }

        $cards = array_merge($this->payments->listPaymentMethods($user), $sumupCards);

        if ($user->default_card_provider) {
            $cards = array_map(
                fn ($c) => $c['provider'] === $user->default_card_provider ? $c : [...$c, 'isDefault' => false],
                $cards
            );
        }

        if ($cards && ! collect($cards)->contains('isDefault', true)) {
            $cards[0]['isDefault'] = true;
        }

        return $cards;
    }
}
