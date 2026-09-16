import { Check } from 'lucide-react'
import clsx from 'clsx'

export default function PaymentOption({ active, onClick, icon, label, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors cursor-pointer',
        active ? 'border-primary bg-primary-lighter/50' : 'border-border hover:border-ink/20'
      )}
    >
      <span className={clsx('flex size-10 items-center justify-center rounded-xl', active ? 'bg-primary text-ink' : 'bg-surface-muted text-ink-soft')}>
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold text-ink">{label}</span>
        <span className="block text-xs text-ink-soft">{sub}</span>
      </span>
      {active && <Check className="size-5 text-ink" />}
    </button>
  )
}
