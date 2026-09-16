import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export default function MegaMenu({ label, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          'flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold cursor-pointer',
          open ? 'text-ink' : 'text-ink-soft hover:text-ink'
        )}
      >
        {label}
        <ChevronDown className={clsx('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-[calc(100%+8px)] w-[min(90vw,560px)] -translate-x-1/2 rounded-2xl border border-border bg-white p-3 shadow-[var(--shadow-pop)] animate-slide-down">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {items.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 rounded-xl p-3 text-left hover:bg-surface-muted"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-ink">
                  {item.icon}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{item.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{item.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
