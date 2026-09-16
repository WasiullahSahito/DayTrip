import clsx from 'clsx'

export default function SectionTitle({ eyebrow, title, description, align = 'center', as: Heading = 'h2', className }) {
  return (
    <div className={clsx('mx-auto max-w-2xl', align === 'center' ? 'text-center' : 'text-left', className)}>
      {eyebrow && (
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1.5 text-xs font-bold text-ink">
          {eyebrow}
        </span>
      )}
      <Heading className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</Heading>
      {description && <p className="mt-3 text-ink-soft">{description}</p>}
    </div>
  )
}
