import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

const VARIANTS = {
  primary:
    'bg-primary text-ink hover:bg-primary-dark active:bg-primary-dark shadow-sm disabled:bg-primary/50',
  dark: 'bg-ink text-white hover:bg-ink-soft active:bg-ink-soft shadow-sm disabled:bg-ink/50',
  outline:
    'bg-white text-ink border border-border hover:border-ink/40 hover:bg-surface-muted disabled:opacity-50',
  ghost: 'bg-transparent text-ink hover:bg-surface-muted disabled:opacity-50',
  danger: 'bg-danger text-white hover:bg-danger/90 disabled:bg-danger/50',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-13 px-6 text-base gap-2',
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, icon, fullWidth, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {!loading && icon}
      {children}
    </button>
  )
})

export default Button
