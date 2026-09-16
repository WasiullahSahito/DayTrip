import SectionTitle from '../common/SectionTitle'
import Card from '../ui/Card'
import { SECURITY_OPTIONS } from '../../data/sectorContent'

export default function SecuritySection() {
  return (
    <section className="bg-surface-muted py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Account controls"
          title="Security options built for accountability"
          description="Keep every booking inside policy with account-level controls you configure once."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {SECURITY_OPTIONS.map((opt) => (
            <Card key={opt.title} className="!p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-ink text-primary">
                <opt.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-bold text-ink">{opt.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{opt.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
