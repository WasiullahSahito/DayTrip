import { useEffect, useState } from 'react'
import { Wallet, CreditCard, Plus } from 'lucide-react'
import Modal from '../ui/Modal'
import PaymentOption from './PaymentOption'
import AddCardModal from './AddCardModal'
import * as paymentService from '../../services/paymentService'

export default function PaymentPickerModal({ open, onClose, value, onChange }) {
  const [cards, setCards] = useState([])
  const [addCardOpen, setAddCardOpen] = useState(false)

  useEffect(() => {
    if (open) paymentService.getCards().then(setCards)
  }, [open])

  return (
    <>
      <Modal open={open} onClose={onClose} title="Payment method" size="sm">
        <div className="space-y-3 pb-2">
          <PaymentOption
            active={value?.type === 'cash'}
            onClick={() => {
              onChange({ type: 'cash' })
              onClose()
            }}
            icon={<Wallet className="size-5" />}
            label="Pay in car"
            sub="Cash or card with your driver"
          />
          {cards.map((c) => (
            <PaymentOption
              key={c.id}
              active={value?.type === 'card' && value.cardId === c.id}
              onClick={() => {
                onChange({ type: 'card', cardId: c.id })
                onClose()
              }}
              icon={<CreditCard className="size-5" />}
              label={`${c.brand} •••• ${c.last4}`}
              sub={c.expiry ? `Expires ${c.expiry}` : c.provider === 'sumup' ? 'SumUp card' : ''}
            />
          ))}
          <button
            type="button"
            onClick={() => setAddCardOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-border p-4 text-left text-ink-soft hover:border-ink/30 hover:text-ink cursor-pointer"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-surface-muted">
              <Plus className="size-5" />
            </span>
            <span className="text-sm font-semibold">Add a new card</span>
          </button>
        </div>
      </Modal>

      <AddCardModal
        open={addCardOpen}
        onClose={() => setAddCardOpen(false)}
        onAdded={(updatedCards) => {
          setCards(updatedCards)
          const newest = updatedCards[updatedCards.length - 1]
          if (newest) onChange({ type: 'card', cardId: newest.id })
          onClose()
        }}
      />
    </>
  )
}
