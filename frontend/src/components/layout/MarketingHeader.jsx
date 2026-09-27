import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Menu,
  X,
  Phone,
  ChevronDown,
  Briefcase,
  Building2,
  HeartPulse,
  Hotel,
  Landmark,
  Car,
  Plane,
  Calculator,
} from 'lucide-react'
import Logo from './Logo'
import Button from '../ui/Button'
import MegaMenu from './MegaMenu'

const BUSINESS_ITEMS = [
  { title: 'Business Taxis', description: 'Tap into convenience and reliability with taxi booking solutions for all business types.', icon: <Briefcase className="size-4.5" />, to: '/business' },
  { title: 'Corporate', description: 'Simplified business travel: save time, cut costs and optimise mobility.', icon: <Building2 className="size-4.5" />, to: '/business/corporate' },
  { title: 'Healthcare', description: 'Patient and carer transportation, booked quickly for those in need.', icon: <HeartPulse className="size-4.5" />, to: '/business/healthcare' },
  { title: 'Hospitality', description: 'Guest or visitor bookings — schedule reliable taxis for your venue.', icon: <Hotel className="size-4.5" />, to: '/business/hospitality' },
  { title: 'Public Sector', description: 'Helping government offices move efficiently and within budget.', icon: <Landmark className="size-4.5" />, to: '/public-sector' },
  { title: 'Book Now', description: 'Start a booking straight away — sign in or register to confirm.', icon: <Car className="size-4.5" />, to: '/book' },
]

const PERSONAL_ITEMS = [
  { title: 'Taxi', description: 'Personalised Galway taxis — book a taxi your way.', icon: <Car className="size-4.5" />, to: '/register' },
  { title: 'Book Now', description: 'Enjoy the full DayTrip booking experience — create your account.', icon: <Car className="size-4.5" />, to: '/book' },
]

const SERVICES_ITEMS = [
  { title: 'Airport Taxi', description: 'Airspeed journeys — elevating your airport travel experience.', icon: <Plane className="size-4.5" />, to: '/business/airport-transfers' },
  { title: 'Fare Estimator', description: "Your fare guide — calculate your journey's cost with ease.", icon: <Calculator className="size-4.5" />, to: '/business/fare-estimator' },
]

export default function MarketingHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <MegaMenu label="Business" items={BUSINESS_ITEMS} />
          <MegaMenu label="Personal" items={PERSONAL_ITEMS} />
          <MegaMenu label="Services" items={SERVICES_ITEMS} />
          <NavLink
            to="/contact"
            className="rounded-lg px-3.5 py-2 text-sm font-semibold text-ink-soft hover:bg-surface-muted hover:text-ink"
          >
            Contact us
          </NavLink>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="tel:+353894298440"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            <Phone className="size-4" /> +353 89 429 8440
          </a>
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Sign up
            </Button>
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-ink hover:bg-surface-muted md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-white px-4 py-4 md:hidden animate-slide-down">
          <MobileSection title="Business" items={BUSINESS_ITEMS} onNavigate={() => setOpen(false)} />
          <MobileSection title="Personal" items={PERSONAL_ITEMS} onNavigate={() => setOpen(false)} />
          <MobileSection title="Services" items={SERVICES_ITEMS} onNavigate={() => setOpen(false)} />
          <NavLink
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg px-3.5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted"
          >
            Contact us
          </NavLink>
          <div className="mt-3 flex gap-2">
            <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="outline" fullWidth>
                Log in
              </Button>
            </Link>
            <Link to="/register" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="primary" fullWidth>
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

function MobileSection({ title, items, onNavigate }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border-b border-border py-1.5">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-bold text-ink cursor-pointer"
      >
        {title}
        <ChevronDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="pb-1.5 pl-1.5">
          {items.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              onClick={onNavigate}
              className="block rounded-lg px-3.5 py-2 text-sm font-medium text-ink-soft hover:bg-surface-muted hover:text-ink"
            >
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
