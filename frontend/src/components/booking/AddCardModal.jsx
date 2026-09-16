import { useEffect, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { ShieldCheck } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'
import { stripePromise } from '../../services/stripe'
import * as paymentService from '../../services/paymentService'

/**
 * Saves a reusable card via a Stripe SetupIntent. Card details are entered
 * directly into Stripe's Payment Element — this component, and the Laravel
 * backend behind it, only ever see the resulting PaymentMethod ID.
 */
export default function AddCardModal({ open, onClose, onAdded }) {
  const [clientSecret, setClientSecret] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state for the new open cycle before the async setup-intent call starts
    setClientSecret(null)
    setError('')
    paymentService
      .createSetupIntent()
      .then(setClientSecret)
      .catch((err) => setError(err.message || 'Unable to start card setup. Please try again.'))
  }, [open])

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Modal open={open} onClose={onClose} title="Add a card" size="sm">
        <p className="py-4 text-center text-sm text-ink-soft">
          Card payments are not configured for this environment yet.
        </p>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a card" size="sm">
      <div className="pb-2">
        {error && <p className="mb-4 rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">{error}</p>}
        {!clientSecret && !error && <Spinner label="Preparing secure card form…" />}
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <SetupForm onClose={onClose} onAdded={onAdded} />
          </Elements>
        )}
      </div>
    </Modal>
  )
}

function SetupForm({ onClose, onAdded }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError('')

    const { error: confirmError, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message || 'Unable to save this card. Please try again.')
      setSubmitting(false)
      return
    }

    try {
      const cards = await paymentService.attachCard(setupIntent.payment_method)
      onAdded?.(cards)
      onClose()
    } catch (err) {
      setError(err.message || 'Unable to save this card. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement options={{ fields: { billingDetails: { name: 'auto' } } }} />
      {error && <p className="rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">{error}</p>}
      <Button type="submit" fullWidth loading={submitting} disabled={!stripe}>
        Save card
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
        <ShieldCheck className="size-3.5" /> Your card details are handled securely by Stripe.
      </p>
    </form>
  )
}
