import clsx from 'clsx'

const TONES = {
  neutral: 'bg-surface-muted text-ink-soft',
  primary: 'bg-primary-light text-ink',
  success: 'bg-success-bg text-success',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-blue-50 text-info',
}

export default function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
