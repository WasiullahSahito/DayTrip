import { useEffect, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { CreditCard, ShieldCheck } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'
import { stripePromise } from '../../services/stripe'
import { api } from '../../services/api'
import * as paymentService from '../../services/paymentService'

/**
 * Card details are entered directly into Stripe's own Payment Element,
 * inside an iframe Stripe controls — the raw number/expiry/CVC never touch
 * this component's state, this app's JavaScript, or the Laravel backend.
 * Only the resulting PaymentIntent confirmation result is handled here.
 */
export default function StripePaymentModal({ open, bookingId, cardId, onClose, onSuccess }) {
  // A saved SumUp card is charged server-side; everything else goes through Stripe's Payment Element.
  if (paymentService.isSumUpCard(cardId)) {
    return <SumUpPaymentModal open={open} bookingId={bookingId} cardId={cardId} onClose={onClose} onSuccess={onSuccess} />
  }
  return <StripeModal open={open} bookingId={bookingId} onClose={onClose} onSuccess={onSuccess} />
}

function StripeModal({ open, bookingId, onClose, onSuccess }) {
  const [clientSecret, setClientSecret] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !bookingId) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state for the new open cycle before the async intent-creation call starts
    setClientSecret(null)
    setError('')

    api.post('/payments/intents', { bookingId })
      .then((data) => {
        if (!cancelled) setClientSecret(data.clientSecret)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to start payment. Please try again.')
      })

    return () => {
      cancelled = true
    }
  }, [open, bookingId])

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Modal open={open} onClose={onClose} title="Card payment" size="sm">
        <div className="py-4 text-center">
          <p className="text-sm text-ink-soft">
            Card payments are not configured for this environment yet. Choose "Pay in car" to continue, or add
            <code className="mx-1 rounded bg-surface-muted px-1.5 py-0.5">VITE_STRIPE_PUBLISHABLE_KEY</code>
            to enable Stripe.
          </p>
          <Button className="mt-4" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirm payment" size="sm">
      <div className="pb-2">
        {error && (
          <p className="mb-4 rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">{error}</p>
        )}

        {!clientSecret && !error && <Spinner label="Preparing secure payment…" />}

        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <CheckoutForm onClose={onClose} onSuccess={onSuccess} />
          </Elements>
        )}
      </div>
    </Modal>
  )
}

function CheckoutForm({ onClose, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError('')

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (confirmError) {
      // A card decline or validation issue from Stripe — never our own
      // guess at what went wrong, since we can't see the card details.
      setError(confirmError.message || 'Your payment could not be completed. Please try another card.')
      setSubmitting(false);
      return
    }

    if (paymentIntent && ['succeeded', 'processing'].includes(paymentIntent.status)) {
      onSuccess()
      return
    }

    setError('Payment requires further action. Please try again.')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">{error}</p>}
      <Button type="submit" fullWidth size="lg" loading={submitting} disabled={!stripe}>
        <CreditCard className="size-4.5" /> Pay now
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
        <ShieldCheck className="size-3.5" /> Payments are processed securely by Stripe.
      </p>
      <button type="button" onClick={onClose} className="w-full text-center text-sm font-semibold text-ink-soft hover:text-ink cursor-pointer">
        Cancel
      </button>
    </form>
  )
}

function SumUpPaymentModal({ open, bookingId, cardId, onClose, onSuccess }) {
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  async function pay() {
    setPaying(true)
    setError('')
    try {
      await paymentService.chargeSumUpCard(bookingId, cardId)
      onSuccess()
    } catch (err) {
      setError(err.message || 'Your payment could not be completed. Please try another card.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirm payment" size="sm">
      <div className="space-y-4 pb-2">
        <p className="text-sm text-ink-soft">Your saved SumUp card will be charged for this booking.</p>
        {error && <p className="rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">{error}</p>}
        <Button fullWidth size="lg" loading={paying} onClick={pay}>
          <CreditCard className="size-4.5" /> Pay now
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
          <ShieldCheck className="size-3.5" /> Payments are processed securely by SumUp.
        </p>
        <button type="button" onClick={onClose} className="w-full text-center text-sm font-semibold text-ink-soft hover:text-ink cursor-pointer">
          Cancel
        </button>
      </div>
    </Modal>
  )
}
