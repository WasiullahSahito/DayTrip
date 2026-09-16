import { Car, Users, Accessibility } from 'lucide-react'
import clsx from 'clsx'

const ICONS = { car: Car, users: Users, accessibility: Accessibility }

export default function VehicleTypeRow({ vehicle, selected, onSelect }) {
  const Icon = ICONS[vehicle.icon] || Car

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'flex w-full items-center gap-4 rounded-2xl border-2 p-3.5 text-left transition-colors cursor-pointer',
        selected ? 'border-primary bg-primary-lighter/50' : 'border-border hover:border-ink/20'
      )}
    >
      <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink-soft">
        <Icon className="size-8" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-ink">{vehicle.name}</span>
        <span className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
          <Users className="size-4" /> {vehicle.passengers} Passengers
        </span>
        {vehicle.caption && <span className="mt-0.5 block text-xs text-ink-soft">{vehicle.caption}</span>}
      </span>
      <span
        className={clsx(
          'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
          selected ? 'border-primary bg-primary' : 'border-border'
        )}
      >
        {selected && <span className="size-2 rounded-full bg-ink" />}
      </span>
    </button>
  )
}
