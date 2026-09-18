import { Plane, ArrowRight, Clock3, Luggage, ShieldCheck, BellRing } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import Card from '../../components/ui/Card'
import CTAButton from '../../components/common/CTAButton'
import FeatureCard from '../../components/common/FeatureCard'
import { ADDRESS_BOOK } from '../../data/addresses'

const AIRPORT = ADDRESS_BOOK.find((a) => a.label.includes('Airport'))
const AIRPORT_REBOOK_STATE = { rebook: { pickup: AIRPORT, destination: null, stops: [] } }

export default function AirportTransfers() {
  usePageMeta('Airport Transfers | DayTrip', 'Reliable airport taxi transfers to and from Galway Airport, with flight tracking and fixed, upfront fares.')

  return (
    <div>
      <section className="bg-ink py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <Plane className="size-3.5" /> Airport Transfers
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Elevating your airport travel
          </h1>
          <p className="mt-4 text-white/70">
            Heading away with family or on a business trip? Rely on DayTrip's Airport Taxi service to
            get you to Galway Airport safely and on time — or track your driver home the moment
            you land.
          </p>
          <div className="mt-7">
            <CTAButton to="/register" state={AIRPORT_REBOOK_STATE} size="lg">
              Book from Galway Airport <ArrowRight className="size-4.5" />
            </CTAButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={<Clock3 className="size-5" />} title="Flight tracking" description="Add your flight number and we'll keep an eye on delays for pickup timing." />
          <FeatureCard icon={<Luggage className="size-5" />} title="Room for luggage" description="Choose Saloon, a 6/7/8-seater, or a Wheelchair-accessible taxi to fit your group." />
          <FeatureCard icon={<ShieldCheck className="size-5" />} title="Fixed, upfront fares" description="Know your fare before you book — no surprises at the terminal." />
          <FeatureCard icon={<BellRing className="size-5" />} title="Meet & greet" description="Your driver waits at arrivals with live status updates on the way." />
        </div>
      </section>

      <section className="bg-surface-muted py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Card className="grid gap-6 !p-8 sm:grid-cols-2 sm:items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-ink">Landing soon?</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Schedule your pickup from Galway Airport in advance and add your flight number —
                we'll have a driver waiting when you land.
              </p>
            </div>
            <CTAButton to="/register" state={AIRPORT_REBOOK_STATE} size="lg">
              Schedule airport pickup <ArrowRight className="size-4.5" />
            </CTAButton>
          </Card>
        </div>
      </section>
    </div>
  )
}
