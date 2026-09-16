import { useEffect, useState } from 'react'
import { Car, Plus, Pencil, Users } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Switch from '../../components/ui/Switch'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../context/ToastContext'
import * as adminService from '../../services/adminService'
import { formatCurrency } from '../../utils/format'

const EMPTY_FORM = { key: '', name: '', passengers: '4', caption: '', baseFare: '', perKm: '', perMin: '', minFare: '', etaMins: '5' }

export default function VehicleTypes() {
  const toast = useToast()
  const [types, setTypes] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function load() {
    adminService.getVehicleTypes().then(setTypes)
  }

  useEffect(load, [])

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(type) {
    setEditing(type)
    setForm({
      key: type.key,
      name: type.name,
      passengers: String(type.passengers),
      caption: type.caption || '',
      baseFare: String(type.baseFare),
      perKm: String(type.perKm),
      perMin: String(type.perMin),
      minFare: String(type.minFare),
      etaMins: String(type.etaMins),
    })
    setErrors({})
    setModalOpen(true)
  }

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setErrors((er) => ({ ...er, [field]: undefined }))
    }
  }

  async function onSave() {
    setSaving(true)
    try {
      const payload = {
        key: form.key,
        name: form.name,
        passengers: parseInt(form.passengers, 10) || 1,
        caption: form.caption || null,
        base_fare: parseFloat(form.baseFare) || 0,
        per_km: parseFloat(form.perKm) || 0,
        per_min: parseFloat(form.perMin) || 0,
        min_fare: parseFloat(form.minFare) || 0,
        eta_mins: parseInt(form.etaMins, 10) || 5,
      }
      if (editing) {
        await adminService.updateVehicleType(editing.id, payload)
        toast.success('Vehicle type updated.')
      } else {
        await adminService.createVehicleType(payload)
        toast.success('Vehicle type added.')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setErrors(err.errors ? Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])) : {})
      toast.error(err.message || 'Failed to save vehicle type.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(type) {
    setTypes((list) => list.map((t) => (t.id === type.id ? { ...t, isActive: !t.isActive } : t)))
    try {
      await adminService.updateVehicleType(type.id, { is_active: !type.isActive })
    } catch (err) {
      toast.error(err.message || 'Failed to update vehicle type.')
      load()
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Vehicle types</h1>
          <p className="text-sm text-ink-soft">Manage the ride categories and fare rates customers can book.</p>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={openAdd}>
          Add vehicle type
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {types === null && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}

        {types !== null && types.length === 0 && (
          <EmptyState
            icon={<Car className="size-6" />}
            title="No vehicle types yet"
            description="Add your first ride category to start taking bookings."
            action={<Button size="sm" onClick={openAdd}>Add vehicle type</Button>}
          />
        )}

        {types?.map((type) => (
          <Card key={type.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-bold text-ink">{type.name}</p>
              <p className="flex items-center gap-1 text-xs text-ink-soft">
                <Users className="size-3.5" /> {type.passengers} passengers &middot; {type.key}
              </p>
              <p className="mt-1 text-xs font-semibold text-ink-soft">
                {formatCurrency(type.baseFare)} base &middot; {formatCurrency(type.perKm)}/km &middot; {formatCurrency(type.minFare)} min fare
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Switch checked={type.isActive} onChange={() => toggleActive(type)} label="Active" />
              <button
                onClick={() => openEdit(type)}
                className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-surface-muted hover:text-ink cursor-pointer"
                aria-label="Edit vehicle type"
              >
                <Pencil className="size-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit vehicle type' : 'Add vehicle type'}
        footer={
          <Button fullWidth loading={saving} onClick={onSave}>
            {editing ? 'Save changes' : 'Add vehicle type'}
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Key" hint="e.g. saloon" value={form.key} onChange={update('key')} error={errors.key} disabled={!!editing} />
            <Input label="Name" value={form.name} onChange={update('name')} error={errors.name} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Passengers" type="number" min="1" value={form.passengers} onChange={update('passengers')} error={errors.passengers} />
            <Input label="ETA (mins)" type="number" min="1" value={form.etaMins} onChange={update('etaMins')} error={errors.eta_mins} />
          </div>
          <Input label="Caption (optional)" value={form.caption} onChange={update('caption')} error={errors.caption} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Base fare" type="number" step="0.01" min="0" value={form.baseFare} onChange={update('baseFare')} error={errors.base_fare} />
            <Input label="Per km" type="number" step="0.01" min="0" value={form.perKm} onChange={update('perKm')} error={errors.per_km} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Per min" type="number" step="0.01" min="0" value={form.perMin} onChange={update('perMin')} error={errors.per_min} />
            <Input label="Minimum fare" type="number" step="0.01" min="0" value={form.minFare} onChange={update('minFare')} error={errors.min_fare} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
