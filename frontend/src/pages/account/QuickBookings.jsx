import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Plus, Trash2, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import AddressField from '../../components/booking/AddressField'
import * as bookingService from '../../services/bookingService'
import { useToast } from '../../context/ToastContext'
import { useVehicleTypes } from '../../hooks/useVehicleTypes'

export default function QuickBookings() {
  const navigate = useNavigate()
  const toast = useToast()
  const vehicles = useVehicleTypes()
  const [items, setItems] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [removing, setRemoving] = useState(false)

  const [label, setLabel] = useState('')
  const [pickup, setPickup] = useState(null)
  const [destination, setDestination] = useState(null)
  const [vehicleId, setVehicleId] = useState('saloon')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    bookingService.getQuickBookings().then(setItems)
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!label.trim() || !pickup || !destination) return
    setSaving(true)
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    const next = await bookingService.addQuickBooking({ label: label.trim(), pickup, destination, vehicle })
    setItems(next)
    setSaving(false)
    setAddOpen(false)
    setLabel('')
    setPickup(null)
    setDestination(null)
    toast.success('Quick booking saved.')
  }

  async function handleRemove() {
    setRemoving(true)
    const next = await bookingService.removeQuickBooking(removeTarget.id)
    setItems(next)
    setRemoving(false)
    setRemoveTarget(null)
    toast.success('Quick booking deleted.')
  }

  function applyQuickBooking(qb) {
    navigate('/app/home', { state: { rebook: { pickup: qb.pickup, destination: qb.destination, vehicle: qb.vehicle, stops: [] } } })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Quick bookings</h1>
          <p className="text-sm text-ink-soft">Save common journeys for one-tap booking.</p>
        </div>
        <Button size="sm" icon={<Plus className="size-4" />} onClick={() => setAddOpen(true)}>
          Add
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {items === null && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}

        {items !== null && items.length === 0 && (
          <EmptyState
            icon={<Zap className="size-6" />}
            title="No Quick Bookings Yet"
            description="Save a journey you take often to book it again in seconds."
            action={
              <Button size="sm" onClick={() => setAddOpen(true)}>
                Create one
              </Button>
            }
          />
        )}

        {(items || []).map((qb) => (
          <Card key={qb.id} className="!p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-ink">{qb.label}</p>
                <p className="mt-0.5 truncate text-sm text-ink-soft">
                  {qb.pickup.label} &rarr; {qb.destination.label}
                </p>
                <p className="text-xs text-ink-soft">{qb.vehicle.name}</p>
              </div>
              <button
                onClick={() => setRemoveTarget(qb)}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-danger-bg hover:text-danger cursor-pointer"
                aria-label="Delete quick booking"
              >
                <Trash2 className="size-4.5" />
              </button>
            </div>
            <Button size="sm" fullWidth className="mt-3" onClick={() => applyQuickBooking(qb)}>
              Book this trip <ArrowRight className="size-4" />
            </Button>
          </Card>
        ))}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New quick booking" size="sm">
        <form onSubmit={handleAdd} className="space-y-4 pb-2">
          <Input label="Name" placeholder="e.g. Commute to work" value={label} onChange={(e) => setLabel(e.target.value)} />
          <AddressField label="Pickup" value={pickup} onChange={setPickup} tone="pickup" />
          <AddressField label="Destination" value={destination} onChange={setDestination} tone="destination" />
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">Vehicle</span>
            <div className="flex flex-wrap gap-2">
              {vehicles.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => setVehicleId(v.id)}
                  className={clsx(
                    'rounded-full border-2 px-3 py-1.5 text-xs font-semibold cursor-pointer',
                    vehicleId === v.id ? 'border-primary bg-primary-lighter/50 text-ink' : 'border-border text-ink-soft'
                  )}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" fullWidth loading={saving} disabled={!label.trim() || !pickup || !destination}>
            Save quick booking
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        loading={removing}
        title="Delete this quick booking?"
        confirmLabel="Yes, delete"
      />
    </div>
  )
}
