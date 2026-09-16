import { ArrowRight } from 'lucide-react'
import CTAButton from './CTAButton'

// Shared bottom-of-page CTA band. ContactCTA and BookingCTA (below) are thin,
// purpose-named wrappers around this so pages read clearly at the call site.
export default function CTABand({ title, description, primary, secondary, dark = true }) {
  return (
    <section className={dark ? 'bg-ink py-16' : 'bg-surface-muted py-16'}>
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${dark ? 'text-white' : 'text-ink'}`}>{title}</h2>
        {description && <p className={`mt-3 ${dark ? 'text-white/70' : 'text-ink-soft'}`}>{description}</p>}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {primary && (
            <CTAButton to={primary.to} size="lg">
              {primary.label} <ArrowRight className="size-4.5" />
            </CTAButton>
          )}
          {secondary && (
            <CTAButton
              to={secondary.to}
              size="lg"
              variant="outline"
              className={dark ? '!bg-transparent !text-white !border-white/25 hover:!bg-white/10' : undefined}
            >
              {secondary.label}
            </CTAButton>
          )}
        </div>
      </div>
    </section>
  )
}
