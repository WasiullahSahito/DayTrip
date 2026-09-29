import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  Clock3,
  Wallet,
  Star,
  Smartphone,
  BarChart3,
  Users2,
  Briefcase,
  Plane,
  Users,
  PartyPopper,
  MapPin,
} from 'lucide-react'
import clsx from 'clsx'
import { usePageMeta } from '../hooks/usePageMeta'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import AddressField from '../components/booking/AddressField'
import VehicleCard from '../components/booking/VehicleCard'
import { useAuth } from '../context/AuthContext'
import { useFareSettings } from '../hooks/useFareSettings'
import { useVehicleTypes } from '../hooks/useVehicleTypes'

const IRISH_COUNTIES = [
  { name: 'Galway', places: 'Kylemore Abbey · Connemara · Salthill' },
  { name: 'Dublin', places: 'Trinity College · Howth · Guinness Storehouse' },
  { name: 'Clare', places: 'Cliffs of Moher · The Burren · Doolin' },
  { name: 'Kerry', places: 'Ring of Kerry · Killarney · Dingle' },
  { name: 'Cork', places: 'Blarney Castle · Kinsale · Cobh' },
  { name: 'Mayo', places: 'Croagh Patrick · Achill Island · Westport' },
  { name: 'Wicklow', places: 'Glendalough · Powerscourt · Wicklow Mountains' },
  { name: 'Donegal', places: 'Slieve League · Glenveagh · Malin Head' },
  { name: 'Sligo', places: 'Benbulben · Strandhill · Lough Gill' },
  { name: 'Limerick', places: 'King John’s Castle · Adare · Lough Gur' },
  { name: 'Kilkenny', places: 'Kilkenny Castle · Jerpoint Abbey · Thomastown' },
  { name: 'Antrim', places: 'Giant’s Causeway · Carrick-a-Rede · Belfast' },
]

// Photos live in frontend/public/trips/<slug>.jpg. Until a file is added the card shows its gradient.
const DAY_TRIPS = [
  { slug: 'cliffs-of-moher', title: 'Cliffs of Moher & the Burren from Galway', duration: '8h', tint: 'from-sky-500 to-emerald-600' },
  { slug: 'kylemore-connemara', title: 'Kylemore Abbey & Connemara from Galway', duration: '6h', tint: 'from-emerald-600 to-teal-800' },
  { slug: 'glendalough', title: 'Glendalough & Wicklow Mountains from Dublin', duration: '7h', tint: 'from-lime-600 to-emerald-800' },
  { slug: 'ring-of-kerry', title: 'Ring of Kerry from Killarney', duration: '8h', tint: 'from-indigo-500 to-sky-600' },
  { slug: 'dingle', title: 'Dingle Peninsula & Slea Head Drive', duration: '7h', tint: 'from-cyan-500 to-blue-700' },
  { slug: 'giants-causeway', title: 'Giant’s Causeway & Causeway Coast from Belfast', duration: '8h', tint: 'from-slate-500 to-cyan-700' },
  { slug: 'blarney-kinsale', title: 'Blarney Castle & Kinsale from Cork', duration: '6h', tint: 'from-amber-500 to-orange-700' },
  { slug: 'slieve-league', title: 'Slieve League & Donegal Coast', duration: '7h', tint: 'from-violet-500 to-indigo-700' },
]

export default function Landing() {
  usePageMeta('Book a Taxi Online | Easy & Convenient Taxi Booking', 'Book your taxi online with an easy-to-use web booker. Manage bookings, track your taxi, and handle all your transport needs from any device.')
  const navigate = useNavigate()
  const { status } = useAuth()
  const FARE = useFareSettings()
  const vehicles = useVehicleTypes()
  const [pickup, setPickup] = useState(null)
  const [destination, setDestination] = useState(null)

  function handleQuickBook(e) {
    e.preventDefault()
    // A signed-in visitor goes straight to the booking screen with their
    // route; everyone else creates an account first, then lands there —
    // either way pickup/destination ride along as router state, not a
    // second location system.
    const target = status === 'authenticated' ? '/app/home' : '/register'
    if (pickup && destination) {
      navigate(target, { state: { rebook: { pickup, destination, stops: [] } } })
    } else {
      navigate(target)
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
                  Book a ride <ArrowRight className="size-4.5" />
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

      {/* Explore Ireland */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-[var(--shadow-card)] sm:p-12">
          <h2 className="mx-auto max-w-3xl text-center text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Explore all 32 counties of Ireland with our private car transfers &amp; day trips
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {IRISH_COUNTIES.map((c) => (
              <Link
                key={c.name}
                to="/register"
                className="rounded-2xl border border-border bg-surface-muted/50 p-4 transition-colors hover:border-ink/30 hover:bg-white"
              >
                <p className="flex items-center gap-2 font-bold text-ink">
                  <MapPin className="size-4 text-primary-dark" /> {c.name}
                </p>
                <p className="mt-1.5 text-sm text-ink-soft">{c.places}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top sightseeing day trips */}
      <section className="bg-surface-muted py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Top sightseeing day trips</h2>
          <p className="mt-3 text-ink-soft">Private-driver day trips across Ireland — no coach schedules, just your group.</p>
          <div className="mt-10 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {DAY_TRIPS.map((t) => (
              <DayTripCard key={t.slug} trip={t} />
            ))}
          </div>
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
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                fare={FARE.baseFare}
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

function DayTripCard({ trip }) {
  const [missing, setMissing] = useState(false)
  return (
    <Link to="/business/fare-estimator" className="group block">
      <div className={clsx('relative aspect-square overflow-hidden rounded-3xl bg-linear-to-br', trip.tint)}>
        {!missing && (
          <img
            src={`/trips/${trip.slug}.jpg`}
            alt={trip.title}
            loading="lazy"
            onError={() => setMissing(true)}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {missing && <MapPin className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-white/60" />}
      </div>
      <h3 className="mt-3 px-1 font-semibold leading-snug text-ink">{trip.title}</h3>
      <p className="mt-1 px-1 text-sm text-ink-soft">About {trip.duration} · Private group</p>
      <p className="px-1 text-sm text-ink-soft underline">Get a price quote</p>
    </Link>
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
