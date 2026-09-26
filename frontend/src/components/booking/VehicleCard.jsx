import { Car, Users, Accessibility } from 'lucide-react'
import clsx from 'clsx'
import { formatCurrency } from '../../utils/format'

const ICONS = { car: Car, users: Users, accessibility: Accessibility }

export default function VehicleCard({ vehicle, fare, selected, onSelect, showEta = true, fromPrice = false, priceSuffix = '' }) {
  const Icon = ICONS[vehicle.icon] || Car

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all cursor-pointer',
        selected ? 'border-primary bg-primary-lighter/50 shadow-sm' : 'border-border hover:border-ink/20'
      )}
    >
      <span
        className={clsx(
          'flex size-14 shrink-0 items-center justify-center rounded-2xl',
          selected ? 'bg-primary text-ink' : 'bg-surface-muted text-ink-soft'
        )}
      >
        <Icon className="size-6" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-bold text-ink">{vehicle.name}</span>
          <span className="flex items-center gap-0.5 text-xs text-ink-soft">
            <Users className="size-3.5" /> {vehicle.passengers}
          </span>
        </span>
        {vehicle.tagline && <span className="mt-0.5 block text-xs text-ink-soft">{vehicle.tagline}</span>}
        {vehicle.caption ? (
          <span className="mt-0.5 block text-xs font-medium text-ink-soft">{vehicle.caption}</span>
        ) : (
          showEta && <span className="mt-0.5 block text-xs font-semibold text-success">{vehicle.etaMins} min away</span>
        )}
      </span>

      <span className="shrink-0 text-right">
        {fromPrice && <span className="block text-[11px] font-medium text-ink-soft">from</span>}
        <span className="block text-lg font-extrabold text-ink">{formatCurrency(fare)}{priceSuffix && <span className="text-xs font-semibold text-ink-soft">{priceSuffix}</span>}</span>
      </span>
    </button>
  )
}
