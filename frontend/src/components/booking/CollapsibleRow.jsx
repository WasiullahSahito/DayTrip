import { ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export default function CollapsibleRow({ icon, title, subtitle, trailing, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-3.5 rounded-2xl border border-border bg-white p-4 text-left hover:border-ink/20 cursor-pointer',
        className
      )}
    >
      {icon && <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-ink">{title}</span>
        {subtitle && <span className="block truncate text-sm text-ink-soft">{subtitle}</span>}
      </span>
      {trailing}
      <ChevronRight className="size-5 shrink-0 text-ink-soft" />
    </button>
  )
}
