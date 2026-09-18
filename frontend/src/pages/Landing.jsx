import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  Clock3,
  Wallet,
  Star,
  Check,
  Smartphone,
  BarChart3,
  Users2,
  Briefcase,
  Plane,
  Users,
  PartyPopper,
} from 'lucide-react'
import clsx from 'clsx'
import { usePageMeta } from '../hooks/usePageMeta'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import AddressField from '../components/booking/AddressField'
import VehicleCard from '../components/booking/VehicleCard'
import { PROFILE_TYPES } from '../data/profileTypes'
import { VEHICLE_TYPES } from '../data/vehicles'

export default function Landing() {
  usePageMeta('Book a Taxi Online | Easy & Convenient Taxi Booking', 'Book your taxi online with an easy-to-use web booker. Manage bookings, track your taxi, and handle all your transport needs from any device.')
  const navigate = useNavigate()
  const [pickup, setPickup] = useState(null)
  const [destination, setDestination] = useState(null)

  function handleQuickBook(e) {
    e.preventDefault()
    if (pickup && destination) {
      navigate('/register', { state: { rebook: { pickup, destination, stops: [] } } })
    } else {
      navigate('/register')
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 65%, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Star className="size-3.5 fill-primary" /> Galway’s online taxi booker
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Book a taxi online,
              <br />
              <span className="text-primary">easy &amp; convenient.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
              Manage bookings, track your taxi, and handle all your transport needs from any
              device. Create an account, add users, and monitor usage — all from your browser.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate('/register')}>
                Get started free <ArrowRight className="size-4.5" />
              </Button>
              <Button size="lg" variant="outline" className="!bg-transparent !text-white !border-white/25 hover:!bg-white/10" onClick={() => navigate('/login')}>
                Log in
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/60">
              <Stat value="24/7" label="Booking &amp; support" />
              <Stat value="4.8/5" label="Average driver rating" />
              <Stat value="< 5 min" label="Typical pickup time" />
            </div>
          </div>

          {/* Quick-book widget */}
          <div className="animate-slide-up">
            <Card className="!rounded-3xl !p-6 shadow-[var(--shadow-pop)] sm:!p-7">
              <p className="mb-4 text-sm font-bold text-ink">Where are you headed?</p>
              <form onSubmit={handleQuickBook} className="space-y-3">
                <AddressField placeholder="Pickup location" value={pickup} onChange={setPickup} tone="pickup" />
                <AddressField placeholder="Destination" value={destination} onChange={setDestination} tone="destination" />
                <Button type="submit" fullWidth size="lg">
                  See prices <ArrowRight className="size-4.5" />
                </Button>
              </form>
              <p className="mt-3 text-center text-xs text-ink-soft">
                No account yet? We’ll get you set up in under a minute.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust bar / feature strip */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          <Feature icon={<ShieldCheck className="size-5" />} title="Vetted drivers" desc="Every driver is licensed & insured" />
          <Feature icon={<Clock3 className="size-5" />} title="Live tracking" desc="Watch your taxi arrive in real time" />
          <Feature icon={<Wallet className="size-5" />} title="Flexible payment" desc="Cash, card, or invoiced billing" />
          <Feature icon={<Smartphone className="size-5" />} title="Book anywhere" desc="Web, app, or phone — your choice" />
        </div>
      </section>

      {/* Services we provide */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Services we provide</h2>
          <p className="mt-3 text-ink-soft">Whatever the journey, there's a DayTrip service built for it.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ServiceCard
            icon={<Briefcase className="size-5" />}
            title="Taxis for Business"
            desc="Reliable taxis for employee and guest transportation, with centralised billing."
            to="/business"
          />
          <ServiceCard
            icon={<Plane className="size-5" />}
            title="Airport Taxis"
            desc="Heading away with family or on a business trip? Get to Galway Airport safely and on time."
            to="/business/airport-transfers"
          />
          <ServiceCard
            icon={<Users className="size-5" />}
            title="Large Multi Seater Taxis"
            desc="Need transport for a group? Our 6, 7, and 8-seaters fit small groups and large families."
            to="/business/fare-estimator"
          />
          <ServiceCard
            icon={<PartyPopper className="size-5" />}
            title="Event Transport"
            desc="Gearing up for a show or exhibition? We'll tailor a bespoke transport solution."
            to="/contact"
          />
        </div>
      </section>

      {/* Multiple ways to travel */}
      <section className="bg-surface-muted py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Multiple ways to travel</h2>
            <p className="mt-3 text-ink-soft">Pick the vehicle that fits your journey — see live pricing when you book.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VEHICLE_TYPES.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                fare={v.minFare}
                fromPrice
                showEta={false}
                selected={false}
                onSelect={() => navigate('/business/fare-estimator')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Booking a ride takes seconds
          </h2>
          <p className="mt-3 text-ink-soft">
            From pickup to drop-off, every step is designed to be fast and predictable.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <Step number="1" title="Set your journey" desc="Enter your pickup, destination, and any stops along the way." />
          <Step number="2" title="Pick your ride" desc="Compare vehicle types and see an upfront fare estimate." />
          <Step number="3" title="Track & go" desc="Follow your driver on the map and get live status updates." />
        </div>
      </section>

      {/* Account types */}
      <section id="personal" className="bg-surface-muted py-20">
        <div id="business" className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              An account for every kind of traveller
            </h2>
            <p className="mt-3 text-ink-soft">
              Whether you’re booking for yourself or your whole team, there’s a plan that fits.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PROFILE_TYPES.map((plan) => (
              <Card
                key={plan.id}
                className={clsx(
                  '!p-7 flex flex-col',
                  plan.highlight && 'border-primary ring-2 ring-primary/40'
                )}
              >
                {plan.highlight && (
                  <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-ink">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-ink">{plan.label}</h3>
                <p className="mt-0.5 text-sm font-semibold text-ink-soft">{plan.subLabel}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{plan.description}</p>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <Button
                    fullWidth
                    variant={plan.highlight ? 'primary' : 'outline'}
                    onClick={() => navigate('/register', { state: { accountType: plan.id } })}
                  >
                    Choose {plan.label}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business callout */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Card className="grid gap-8 !p-8 sm:!p-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1.5 text-xs font-bold text-ink">
              <BarChart3 className="size-3.5" /> For teams
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">
              Give your business full visibility
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              Add users, set travel policies, and get consolidated invoicing with expense
              reports built in — so every trip is accounted for.
            </p>
            <Button className="mt-6" onClick={() => navigate('/register', { state: { accountType: 'business-plus' } })}>
              Set up a business account <ArrowRight className="size-4.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MiniStat icon={<Users2 className="size-5" />} value="Unlimited" label="team members on Business+" />
            <MiniStat icon={<Wallet className="size-5" />} value="Weekly" label="or monthly invoicing" />
            <MiniStat icon={<ShieldCheck className="size-5" />} value="Secure" label="PIN-protected bookings" />
            <MiniStat icon={<BarChart3 className="size-5" />} value="Live" label="expense reporting" />
          </div>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="bg-ink py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to ride?
          </h2>
          <p className="mt-3 text-white/70">Create your free account and book your first trip in minutes.</p>
          <Button size="lg" className="mt-7" onClick={() => navigate('/register')}>
            Create free account <ArrowRight className="size-4.5" />
          </Button>
        </div>
      </section>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-lg font-extrabold text-white">{value}</p>
      <p>{label}</p>
    </div>
  )
}

function ServiceCard({ icon, title, desc, to }) {
  return (
    <Link to={to} className="block">
      <Card className="h-full !p-6 transition-shadow hover:shadow-[var(--shadow-pop)]">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary-light text-ink">{icon}</span>
        <h3 className="mt-4 font-bold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{desc}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
          Learn more <ArrowRight className="size-3.5" />
        </span>
      </Card>
    </Link>
  )
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-ink">
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-ink">{title}</p>
        <p className="text-xs text-ink-soft">{desc}</p>
      </div>
    </div>
  )
}

function Step({ number, title, desc }) {
  return (
    <Card className="!p-7">
      <span className="flex size-10 items-center justify-center rounded-full bg-ink text-sm font-extrabold text-primary">
        {number}
      </span>
      <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{desc}</p>
    </Card>
  )
}

function MiniStat({ icon, value, label }) {
  return (
    <div className="rounded-2xl bg-surface-muted p-4">
      <span className="flex size-9 items-center justify-center rounded-lg bg-white text-ink">{icon}</span>
      <p className="mt-3 text-base font-extrabold text-ink">{value}</p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  )
}
