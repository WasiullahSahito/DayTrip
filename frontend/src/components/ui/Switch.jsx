import clsx from 'clsx'

export default function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!checked)
      }}
      className={clsx(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer',
        checked ? 'bg-primary' : 'bg-border'
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}
