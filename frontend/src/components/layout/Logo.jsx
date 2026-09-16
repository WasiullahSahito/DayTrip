import clsx from 'clsx'

export default function Logo({ className, mark = true, light = false }) {
  return (
    <span className={clsx('inline-flex items-center gap-2 font-bold tracking-tight', className)}>
      {mark && (
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-ink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 17.5 8.5 6h7L20 17.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="7.5" cy="17.5" r="1.7" fill="currentColor" />
            <circle cx="16.5" cy="17.5" r="1.7" fill="currentColor" />
          </svg>
        </span>
      )}
      <span className={clsx('text-xl', light ? 'text-white' : 'text-ink')}>DayTrip</span>
    </span>
  )
}
