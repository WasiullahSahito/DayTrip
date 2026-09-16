import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import clsx from 'clsx'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative z-10 w-full rounded-t-3xl bg-white shadow-[var(--shadow-pop)] animate-slide-up',
          'sm:rounded-3xl sm:animate-fade-in max-h-[88vh] flex flex-col',
          size === 'sm' && 'sm:max-w-sm',
          size === 'md' && 'sm:max-w-md',
          size === 'lg' && 'sm:max-w-lg',
          size === 'xl' && 'sm:max-w-2xl'
        )}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-border sm:hidden" />
        {title && (
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full text-ink-soft hover:bg-surface-muted cursor-pointer"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-3">{children}</div>
        {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
