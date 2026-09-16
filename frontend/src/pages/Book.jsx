import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ArrowRight, Car } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import CTAButton from '../components/common/CTAButton'
import AddressField from '../components/booking/AddressField'
import RouteMap from '../components/booking/RouteMap'

// The full booking engine (live tracking, saved cards, favourites) lives at
// /app/home behind auth. This is the public entry point: a signed-in visitor
// is sent straight there; everyone else gets a lightweight teaser that
// hands their route to registration rather than re-implementing booking twice.
export default function Book() {
  usePageMeta('Book a Taxi | DayTrip', 'Book a taxi online in seconds — enter your pickup and destination to get started.')
  const { status } = useAuth()
  const [pickup, setPickup] = useState(null)
  const [destination, setDestination] = useState(null)

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Loading…" />
      </div>
    )
  }

  if (status === 'authenticated') {
    return <Navigate to="/app/home" replace />
  }

  const hasRoute = pickup && destination

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1.5 text-xs font-bold text-ink">
          <Car className="size-3.5" /> Book a Taxi
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Where are you headed?</h1>
        <p className="mt-3 text-ink-soft">
          Enter your journey below — you'll confirm your ride, vehicle, and payment once you're signed in.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        <Card className="space-y-4 !p-6">
          <AddressField label="Pickup location" placeholder="Enter pickup address" value={pickup} onChange={setPickup} tone="pickup" autoFocus />
          <AddressField label="Destination" placeholder="Where to?" value={destination} onChange={setDestination} tone="destination" />

          <CTAButton
            to="/register"
            state={hasRoute ? { rebook: { pickup, destination, stops: [] } } : undefined}
            fullWidth
            size="lg"
            disabled={!hasRoute}
          >
            Continue to book <ArrowRight className="size-4.5" />
          </CTAButton>

          <p className="text-center text-xs text-ink-soft">
            Already have an account? <CTAButtonInlineLogin />
          </p>
        </Card>

        <RouteMap pickup={pickup} destination={destination} className="aspect-4/3 w-full lg:sticky lg:top-24 lg:aspect-auto lg:h-[520px]" />
      </div>
    </div>
  )
}

function CTAButtonInlineLogin() {
  return (
    <CTAButton to="/login" variant="ghost" size="sm" className="!h-auto !px-1 !py-0 !text-ink underline">
      Log in
    </CTAButton>
  )
}
