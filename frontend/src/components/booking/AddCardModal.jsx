import { useEffect, useRef, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { ShieldCheck } from 'lucide-react'
import clsx from 'clsx'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'
import { stripePromise } from '../../services/stripe'
import { loadSumUpCard } from '../../services/sumup'
import * as paymentService from '../../services/paymentService'

const PROVIDERS = [
  { id: 'stripe', label: 'Stripe' },
  { id: 'sumup', label: 'SumUp' },
]

/**
 * Saves a reusable card with either Stripe or SumUp. In both cases the card
 * details are typed into the provider's own hosted form (Stripe's Payment
 * Element / SumUp's Card Widget) — this component, and the Laravel backend
 * behind it, never see the card number, expiry or CVC.
 */
export default function AddCardModal({ open, onClose, onAdded }) {
  const [provider, setProvider] = useState('stripe')

  return (
    <Modal open={open} onClose={onClose} title="Add a card" size="sm">
      <div className="pb-2">
        <div role="tablist" aria-label="Card provider" className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-surface-muted p-1">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={provider === p.id}
              onClick={() => setProvider(p.id)}
              className={clsx(
                'h-10 rounded-lg text-sm font-bold transition-colors cursor-pointer',
                provider === p.id ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {open && provider === 'stripe' && <StripeCardForm onClose={onClose} onAdded={onAdded} />}
        {open && provider === 'sumup' && <SumUpCardForm onClose={onClose} onAdded={onAdded} />}
      </div>
    </Modal>
  )
}

// -- Stripe --

function StripeCardForm({ onClose, onAdded }) {
  const [clientSecret, setClientSecret] = useState(null)
  const [error, setError] = useState('')
  const configured = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

  useEffect(() => {
    if (!configured) return
    paymentService
      .createSetupIntent()
      .then(setClientSecret)
      .catch((err) => setError(err.message || 'Unable to start card setup. Please try again.'))
  }, [configured])

  if (!configured) {
    return <p className="py-4 text-center text-sm text-ink-soft">Card payments are not configured for this environment yet.</p>
  }

  return (
    <>
      {error && <p className="mb-4 rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">{error}</p>}
      {!clientSecret && !error && <Spinner label="Preparing secure card form…" />}
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <StripeSetupForm onClose={onClose} onAdded={onAdded} />
        </Elements>
      )}
    </>
  )
}

function StripeSetupForm({ onClose, onAdded }) {
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

// -- SumUp --

function SumUpCardForm({ onClose, onAdded }) {
  const containerId = 'sumup-card'
  const [status, setStatus] = useState('loading') // loading | ready | saving | error
  const [error, setError] = useState('')
  // The widget's callback outlives renders, so it reads the latest props via a ref.
  const callbacks = useRef({ onClose, onAdded })
  useEffect(() => {
    callbacks.current = { onClose, onAdded }
  })

  useEffect(() => {
    let cancelled = false
    let widget = null

    async function start() {
      try {
        const [checkoutId, SumUpCard] = await Promise.all([
          paymentService.createSumUpCheckout(),
          loadSumUpCard(),
        ])
        if (cancelled) return

        widget = SumUpCard.mount({
          id: containerId,
          checkoutId,
          onResponse: async (type) => {
            if (cancelled) return
            if (type === 'success') {
              setStatus('saving')
              try {
                const cards = await paymentService.confirmSumUpSetup(checkoutId)
                if (cancelled) return
                callbacks.current.onAdded?.(cards)
                callbacks.current.onClose()
              } catch (err) {
                if (cancelled) return
                setError(err.message || 'Unable to save this card. Please try again.')
                setStatus('error')
              }
            } else if (type === 'error' || type === 'fail' || type === 'invalid') {
              setError('This card could not be saved. Please check the details or try another card.')
            }
          },
        })
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        setError(err.message || 'Unable to start card setup. Please try again.')
        setStatus('error')
      }
    }

    start()

    return () => {
      cancelled = true
      widget?.unmount?.()
    }
  }, [])

  return (
    <div>
      {error && <p className="mb-4 rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">{error}</p>}
      {status === 'loading' && <Spinner label="Preparing secure card form…" />}
      {status === 'saving' && <Spinner label="Saving your card…" />}
      <div id={containerId} className={clsx((status === 'loading' || status === 'saving' || status === 'error') && 'hidden')} />
      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
        <ShieldCheck className="size-3.5" /> Your card details are handled securely by SumUp.
      </p>
    </div>
  )
}
