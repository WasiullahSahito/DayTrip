import clsx from 'clsx'

export default function Card({ className, children, padded = true, ...props }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-white shadow-[var(--shadow-card)]',
        padded && 'p-4 sm:p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
