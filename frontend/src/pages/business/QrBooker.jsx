import { QrCode, Smartphone, Zap, MapPin, ArrowRight } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import SectionTitle from '../../components/common/SectionTitle'
import FeatureCard from '../../components/common/FeatureCard'
import CTAButton from '../../components/common/CTAButton'
import Card from '../../components/ui/Card'
import ContactCTA from '../../components/common/ContactCTA'

const STEPS = [
  { title: 'We print your code', desc: 'A unique QR code is generated for your property and pre-filled with your pickup address.' },
  { title: 'Guests scan it', desc: 'Any phone camera opens the booking page instantly — no app to download.' },
  { title: 'A taxi is on its way', desc: 'The guest confirms their destination and the booking goes straight to dispatch.' },
]

export default function QrBooker() {
  usePageMeta('QR Taxi Booker | Lynk', 'Place a QR code at reception or in guest rooms — guests scan to book a taxi with no app required.')

  return (
    <div>
      <section className="relative overflow-hidden bg-ink py-20">
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <QrCode className="size-3.5" /> QR Taxi Booker
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Scan to book. That's it.
          </h1>
          <p className="mt-4 text-white/70">
            Place the QR code in high-traffic areas — reception, the lobby, guest rooms — so anyone
            can book a taxi without downloading anything or waiting on hold.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="flex size-48 items-center justify-center rounded-3xl bg-white/10 text-primary">
              <QrCode className="size-24" strokeWidth={1} />
            </div>
          </div>
          <div className="mt-8">
            <CTAButton to="/register" size="lg">
              Get your QR code <ArrowRight className="size-4.5" />
            </CTAButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionTitle eyebrow="How it works" title="Three steps, no training required" />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="!p-7">
              <span className="flex size-10 items-center justify-center rounded-full bg-ink text-sm font-extrabold text-primary">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-surface-muted py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="Built for hospitality" title="Why properties add a QR code at reception" />
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            <FeatureCard icon={<Smartphone className="size-5" />} title="No app needed" description="Works in any mobile browser — nothing for guests to install." />
            <FeatureCard icon={<MapPin className="size-5" />} title="Pre-filled pickup" description="Your property's address is set automatically, so guests just add a destination." />
            <FeatureCard icon={<Zap className="size-5" />} title="Less reception workload" description="Guests book themselves in seconds instead of queuing at the desk." />
          </div>
        </div>
      </section>

      <ContactCTA title="Want a QR code for your property?" description="We'll generate and send you a printable code, ready to display today." />
    </div>
  )
}
