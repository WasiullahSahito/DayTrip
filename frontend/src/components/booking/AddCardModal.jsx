import { useEffect, useRef, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import clsx from 'clsx'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'
import { loadSumUpCard } from '../../services/sumup'
import * as paymentService from '../../services/paymentService'

/**
 * Saves a reusable card with SumUp. The card details are typed into SumUp's own
 * hosted Card Widget — this component, and the Laravel backend behind it, never
 * see the card number, expiry or CVC.
 */
export default function AddCardModal({ open, onClose, onAdded }) {
  return (
    <Modal open={open} onClose={onClose} title="Pay by card" size="sm">
      <div className="pb-2">{open && <SumUpCardForm onClose={onClose} onAdded={onAdded} />}</div>
    </Modal>
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
