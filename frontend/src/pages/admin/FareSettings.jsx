import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Skeleton from '../../components/ui/Skeleton'
import { useToast } from '../../context/ToastContext'
import * as adminService from '../../services/adminService'
import { formatCurrency } from '../../utils/format'

const FIELD_BY_API_KEY = {
  base_fare: 'baseFare',
  per_km: 'perKm',
  per_passenger: 'perPassenger',
  waiting_per_minute: 'waitingPerMinute',
}

function toForm(s) {
  return {
    baseFare: String(s.baseFare),
    perKm: String(s.perKm),
    perPassenger: String(s.perPassenger),
    waitingPerMinute: String(s.waitingPerMinute),
  }
}

export default function FareSettings() {
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [maxWaiting, setMaxWaiting] = useState(60)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminService.getFareSettings().then((s) => {
      setForm(toForm(s))
      setMaxWaiting(s.maxWaitingMinutes)
    })
  }, [])

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setErrors((er) => ({ ...er, [field]: undefined }))
    }
  }

  async function onSave() {
    setSaving(true)
    try {
      const saved = await adminService.updateFareSettings({
        base_fare: parseFloat(form.baseFare),
        per_km: parseFloat(form.perKm),
        per_passenger: parseFloat(form.perPassenger),
        waiting_per_minute: parseFloat(form.waitingPerMinute),
      })
      setForm(toForm(saved))
      toast.success('Fare settings updated.')
    } catch (err) {
      setErrors(
        err.errors
          ? Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [FIELD_BY_API_KEY[k] || k, v[0]]))
          : {}
      )
      toast.error(err.message || 'Failed to save fare settings.')
    } finally {
      setSaving(false)
    }
  }

  const baseFare = parseFloat(form?.baseFare) || 0
  const perKm = parseFloat(form?.perKm) || 0
  const perPassenger = parseFloat(form?.perPassenger) || 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-extrabold text-ink">Fare settings</h1>
      <p className="text-sm text-ink-soft">
        Fare = base fare + per-km rate × km + per-passenger charge × passengers + waiting charge. Changes apply to new bookings
        and quotes straight away.
      </p>

      <Card className="mt-6 space-y-4 !p-5">
        {!form ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <>
            <Input label="Base fare (€)" type="number" step="0.01" min="0" value={form.baseFare} onChange={update('baseFare')} error={errors.baseFare} />
            <Input label="Price per km (€)" type="number" step="0.01" min="0" value={form.perKm} onChange={update('perKm')} error={errors.perKm} />
            <Input label="Charge per passenger (€)" type="number" step="0.01" min="0" value={form.perPassenger} onChange={update('perPassenger')} error={errors.perPassenger} />
            <Input
              label="Waiting charge per minute (€)"
              type="number"
              step="0.01"
              min="0"
              value={form.waitingPerMinute}
              onChange={update('waitingPerMinute')}
              error={errors.waitingPerMinute}
              hint={`Charged per minute of waiting, for up to ${maxWaiting} minutes (one hour) at most.`}
            />
            <p className="rounded-xl bg-surface-muted p-3 text-sm text-ink-soft">
              Example: a 10 km trip with 3 passengers and no waiting costs{' '}
              <strong className="text-ink">{formatCurrency(baseFare + 10 * perKm + 3 * perPassenger)}</strong>.
            </p>
            <Button icon={<Save className="size-4" />} loading={saving} onClick={onSave}>
              Save changes
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}
