import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function Spinner({ className, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-ink-soft">
      <Loader2 className={clsx('size-7 animate-spin text-primary', className)} />
      {label && <p className="text-sm font-medium">{label}</p>}
    </div>
  )
}
