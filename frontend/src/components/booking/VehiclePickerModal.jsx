import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import VehicleTypeRow from './VehicleTypeRow'
import { useVehicleTypes } from '../../hooks/useVehicleTypes'

export default function VehiclePickerModal({ open, onClose, value, onChange }) {
  const vehicles = useVehicleTypes()
  const [pending, setPending] = useState(value)
  const [wasOpen, setWasOpen] = useState(open)

  // Re-seed the pending selection from the committed value each time the modal opens
  // (the modal itself never unmounts — Modal just renders null while closed — so this
  // can't be plain initial state). Derived during render rather than an effect.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setPending(value)
  }

  function save() {
    onChange(pending)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vehicle Type"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth onClick={save} disabled={!pending}>
            Save
          </Button>
        </div>
      }
      size="sm"
    >
      <div className="space-y-3 pb-2">
        {vehicles.map((v) => (
          <VehicleTypeRow key={v.id} vehicle={v} selected={pending === v.id} onSelect={() => setPending(v.id)} />
        ))}
      </div>
    </Modal>
  )
}
