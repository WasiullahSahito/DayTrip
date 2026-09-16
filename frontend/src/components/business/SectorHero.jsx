import { Check } from 'lucide-react'
import CTAButton from '../common/CTAButton'

export default function SectorHero({ eyebrow, title, description, bullets = [], primaryCta, secondaryCta, Icon }) {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 65%, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
        <div className="animate-fade-in">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{description}</p>

          {bullets.length > 0 && (
            <ul className="mt-7 space-y-2.5">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-white/80 sm:text-base">
                  <Check className="mt-0.5 size-4.5 shrink-0 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {primaryCta && (
              <CTAButton to={primaryCta.to} size="lg">
                {primaryCta.label}
              </CTAButton>
            )}
            {secondaryCta && (
              <CTAButton
                to={secondaryCta.to}
                size="lg"
                variant="outline"
                className="!bg-transparent !text-white !border-white/25 hover:!bg-white/10"
              >
                {secondaryCta.label}
              </CTAButton>
            )}
          </div>
        </div>

        {Icon && (
          <div className="hidden justify-center lg:flex animate-slide-up">
            <div className="flex size-72 items-center justify-center rounded-[2.5rem] bg-white/5 text-primary ring-1 ring-white/10">
              <Icon className="size-28" strokeWidth={1.25} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
