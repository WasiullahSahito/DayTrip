import { useEffect, useState } from 'react'
import { Car, Plus, Pencil, Trash2, Star } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Switch from '../../components/ui/Switch'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../context/ToastContext'
import * as adminService from '../../services/adminService'

const EMPTY_FORM = { name: '', phone: '', rating: '5.0', reg: '', car: '', color: '' }

export default function Drivers() {
  const toast = useToast()
  const [drivers, setDrivers] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function load() {
    adminService.getDrivers().then((page) => setDrivers(page.data))
  }

  useEffect(load, [])

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(driver) {
    setEditing(driver)
    setForm({ name: driver.name, phone: driver.phone || '', rating: String(driver.rating), reg: driver.reg, car: driver.car, color: driver.color })
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
      const payload = { ...form, rating: parseFloat(form.rating) || 5.0 }
      if (editing) {
        await adminService.updateDriver(editing.id, payload)
        toast.success('Driver updated.')
      } else {
        await adminService.createDriver(payload)
        toast.success('Driver added.')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setErrors(err.errors ? Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])) : {})
      toast.error(err.message || 'Failed to save driver.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(driver) {
    setDrivers((list) => list.map((d) => (d.id === driver.id ? { ...d, isActive: !d.isActive } : d)))
    try {
      await adminService.updateDriver(driver.id, { is_active: !driver.isActive })
    } catch (err) {
      toast.error(err.message || 'Failed to update driver.')
      load()
    }
  }

  async function onDelete() {
    setDeleting(true)
    try {
      await adminService.deleteDriver(deleteTarget.id)
      toast.success('Driver removed.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to remove driver.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Drivers</h1>
          <p className="text-sm text-ink-soft">Add, edit, and manage the driver pool.</p>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={openAdd}>
          Add driver
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {drivers === null && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}

        {drivers !== null && drivers.length === 0 && (
          <EmptyState
            icon={<Car className="size-6" />}
            title="No drivers yet"
            description="Add your first driver to start assigning them to bookings."
            action={<Button size="sm" onClick={openAdd}>Add driver</Button>}
          />
        )}

        {drivers?.map((driver) => (
          <Card key={driver.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-bold text-ink">{driver.name}</p>
              <p className="truncate text-xs text-ink-soft">
                {driver.car} &middot; {driver.color} &middot; {driver.reg}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-ink-soft">
                <Star className="size-3.5 fill-tertiary text-tertiary" /> {Number(driver.rating).toFixed(1)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Switch checked={driver.isActive} onChange={() => toggleActive(driver)} label="Active" />
              <button
                onClick={() => openEdit(driver)}
                className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-surface-muted hover:text-ink cursor-pointer"
                aria-label="Edit driver"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => setDeleteTarget(driver)}
                className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-danger-bg hover:text-danger cursor-pointer"
                aria-label="Delete driver"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit driver' : 'Add driver'}
        footer={
          <Button fullWidth loading={saving} onClick={onSave}>
            {editing ? 'Save changes' : 'Add driver'}
          </Button>
        }
      >
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={update('name')} error={errors.name} />
          <Input label="Phone" value={form.phone} onChange={update('phone')} error={errors.phone} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Registration plate" value={form.reg} onChange={update('reg')} error={errors.reg} />
            <Input label="Rating" type="number" step="0.1" min="1" max="5" value={form.rating} onChange={update('rating')} error={errors.rating} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Car" value={form.car} onChange={update('car')} error={errors.car} />
            <Input label="Color" value={form.color} onChange={update('color')} error={errors.color} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Remove this driver?"
        description={deleteTarget ? `${deleteTarget.name} will no longer be available for new bookings.` : ''}
        confirmLabel="Remove driver"
      />
    </div>
  )
}
