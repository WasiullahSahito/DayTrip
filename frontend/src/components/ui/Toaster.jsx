import { createPortal } from 'react-dom'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import clsx from 'clsx'
import { useToastList } from '../../context/ToastContext'

const ICONS = {
  success: <CheckCircle2 className="size-5 text-success" />,
  error: <XCircle className="size-5 text-danger" />,
  info: <Info className="size-5 text-info" />,
}

export default function Toaster() {
  const { toasts, dismiss } = useToastList()

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:top-5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border bg-white p-3.5 shadow-[var(--shadow-pop)] animate-slide-down',
            t.type === 'error' ? 'border-danger/30' : t.type === 'success' ? 'border-success/30' : 'border-border'
          )}
        >
          {ICONS[t.type]}
          <p className="flex-1 text-sm font-medium text-ink">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="text-ink-soft hover:text-ink cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  )
}
