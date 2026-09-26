import { useEffect, useState } from 'react'
import { CreditCard, Plus, Trash2, CheckCircle2, Wallet } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import AddCardModal from '../../components/booking/AddCardModal'
import * as paymentService from '../../services/paymentService'
import { useToast } from '../../context/ToastContext'

export default function PaymentMethods() {
  const toast = useToast()
  const [cards, setCards] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    paymentService.getCards().then(setCards)
  }, [])

  async function handleRemove() {
    setRemoving(true)
    const next = await paymentService.removeCard(removeTarget.id)
    setCards(next)
    setRemoving(false)
    setRemoveTarget(null)
    toast.success('Card removed.')
  }

  async function handleSetDefault(id) {
    const next = await paymentService.setDefaultCard(id)
    setCards(next)
    toast.success('Default payment method updated.')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Payment methods</h1>
          <p className="text-sm text-ink-soft">Manage your saved cards for faster checkout.</p>
        </div>
        <Button size="sm" icon={<Plus className="size-4" />} onClick={() => setAddOpen(true)}>
          Add card
        </Button>
      </div>

      <Card className="mt-6 flex items-center gap-3.5 !p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink-soft">
          <Wallet className="size-5" />
        </span>
        <div>
          <p className="font-bold text-ink">Pay in car</p>
          <p className="text-sm text-ink-soft">Always available — cash or card with your driver</p>
        </div>
      </Card>

      <div className="mt-3 space-y-3">
        {cards === null && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}

        {cards !== null && cards.length === 0 && (
          <EmptyState
            icon={<CreditCard className="size-6" />}
            title="No cards saved"
            description="Add a card to pay instantly at the end of your trip."
            action={
              <Button size="sm" onClick={() => setAddOpen(true)}>
                Add your first card
              </Button>
            }
          />
        )}

        {(cards || []).map((c) => (
          <Card key={c.id} className="flex items-center gap-3.5 !p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-ink">
              <CreditCard className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-bold text-ink">
                {c.brand} &middot;&middot;&middot;&middot; {c.last4}
                {c.provider === 'sumup' && (
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-bold text-ink-soft">SumUp</span>
                )}
                {c.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-bold text-success">
                    <CheckCircle2 className="size-3" /> Default
                  </span>
                )}
              </p>
              <p className="text-sm text-ink-soft">{c.expiry ? `Expires ${c.expiry}` : c.provider === 'sumup' ? 'Saved with SumUp' : ''}</p>
            </div>
            {!c.isDefault && (
              <button
                onClick={() => handleSetDefault(c.id)}
                className="text-xs font-semibold text-ink-soft hover:text-ink cursor-pointer"
              >
                Set default
              </button>
            )}
            <button
              onClick={() => setRemoveTarget(c)}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-danger-bg hover:text-danger cursor-pointer"
              aria-label="Remove card"
            >
              <Trash2 className="size-4.5" />
            </button>
          </Card>
        ))}
      </div>

      <AddCardModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={setCards} />

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        loading={removing}
        title="Remove this card?"
        description={removeTarget ? `${removeTarget.brand} •••• ${removeTarget.last4} will be removed.` : ''}
        confirmLabel="Yes, remove"
      />
    </div>
  )
}
