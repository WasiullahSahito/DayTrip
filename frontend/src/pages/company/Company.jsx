import { Link } from 'react-router-dom'
import { ArrowRight, Car, Users, MapPin, ShieldCheck } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import SectionTitle from '../../components/common/SectionTitle'
import FeatureCard from '../../components/common/FeatureCard'
import CTABand from '../../components/common/CTABand'

const STATS = [
  { value: '2013', label: 'Founded in Dublin' },
  { value: '1,000+', label: 'Drivers on the network' },
  { value: '24/7', label: 'Booking & support' },
]

export default function Company() {
  usePageMeta('About Lynk', 'Lynk is Dublin’s taxi booking platform for individuals and businesses — online, in-app, or by phone.')

  return (
    <div>
      <section className="bg-ink py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Moving Dublin, reliably</h1>
          <p className="mt-4 text-white/70">
            Lynk connects passengers and businesses with a professional taxi network across
            Dublin — booked online, in the app, or by phone.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border p-6 text-center">
              <p className="text-3xl font-extrabold text-ink">{s.value}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-muted py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="What we stand for" title="Built on reliability and accountability" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={<ShieldCheck className="size-5" />} title="Safety first" description="Every driver on the network is licensed and insured." />
            <FeatureCard icon={<Car className="size-5" />} title="Always available" description="24/7 booking across web, app, and phone." />
            <FeatureCard icon={<Users className="size-5" />} title="For everyone" description="Personal riders and businesses of every size." />
            <FeatureCard icon={<MapPin className="size-5" />} title="Local focus" description="Purpose-built for Dublin, from the ground up." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <Link to="/company/our-story" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink hover:underline">
          Read our story <ArrowRight className="size-4" />
        </Link>
      </section>

      <CTABand
        title="Ready to ride with Lynk?"
        description="Register in minutes as a personal rider or set up a business account."
        primary={{ label: 'Register for Free', to: '/register' }}
        secondary={{ label: 'Explore Business', to: '/business' }}
      />
    </div>
  )
}
