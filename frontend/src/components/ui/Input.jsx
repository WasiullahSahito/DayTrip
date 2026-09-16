import { forwardRef, useId, useState } from 'react'
import clsx from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(function Input(
  { label, error, hint, icon, type = 'text', id, className, containerClassName, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className={clsx('block', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <span className="relative flex items-center">
        {icon && <span className="pointer-events-none absolute left-3.5 text-ink-soft">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={clsx(
            'h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink placeholder:text-ink-soft/60 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary',
            icon && 'pl-10',
            isPassword && 'pr-11',
            error ? 'border-danger' : 'border-border',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 text-ink-soft hover:text-ink cursor-pointer"
            aria-label={show ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
          </button>
        )}
      </span>
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-danger animate-slide-down">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-ink-soft">{hint}</span>
      ) : null}
    </div>
  )
})

export default Input
