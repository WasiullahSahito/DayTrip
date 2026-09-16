import { ArrowRight, Clock3, Wallet, ShieldCheck, Smartphone, BarChart3, Car } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useAuth } from '../../context/AuthContext'
import CTAButton from '../../components/common/CTAButton'
import SectionTitle from '../../components/common/SectionTitle'
import FeatureCard from '../../components/common/FeatureCard'
import SolutionsForEverySector from '../../components/business/SolutionsForEverySector'
import PaymentPlans from '../../components/business/PaymentPlans'
import CTABand from '../../components/common/CTABand'

export default function Business() {
  usePageMeta(
    'Lynk Business Taxi Services',
    'Business taxi booking for every sector — corporate, healthcare, hospitality, and public sector. Register for free or get a demo.'
  )
  const { status } = useAuth()

  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 65%, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            Lynk Business
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Business transportation, without the overhead
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            One account for employee travel, guest bookings, and everything in between. Book on
            the web, in the app, or by phone — every trip lands on one itemised, auditable bill.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <CTAButton to="/register" size="lg">
              Register for Free <ArrowRight className="size-4.5" />
            </CTAButton>
            <CTAButton
              to="/get-demo"
              size="lg"
              variant="outline"
              className="!bg-transparent !text-white !border-white/25 hover:!bg-white/10"
            >
              Get a Demo
            </CTAButton>
          </div>
          <CTAButton to="/book" variant="ghost" className="mt-4 !text-white/70 hover:!text-white">
            {status === 'authenticated' ? 'Go to booking' : 'Or book a single ride'} <Car className="size-4" />
          </CTAButton>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          <FeatureCard bare icon={<Clock3 className="size-5" />} title="Save time" description="No expense claims — every trip is billed centrally." />
          <FeatureCard bare icon={<Wallet className="size-5" />} title="Manage costs" description="Set spending controls and see spend in real time." />
          <FeatureCard bare icon={<ShieldCheck className="size-5" />} title="Stay safe" description="Every driver on the network is licensed and insured." />
          <FeatureCard bare icon={<Smartphone className="size-5" />} title="Book anywhere" description="Web, app, or a 24/7 phone line — your team's choice." />
        </div>
      </section>

      <SolutionsForEverySector title="Solutions for every sector" />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionTitle
          eyebrow="Why Lynk Business"
          title="A professional network, built for accountability"
          description="Everything your finance and operations teams need, without slowing your team down."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={<BarChart3 className="size-5" />} title="Real-time reporting" description="See trip volume and spend by user, department, or cost centre as it happens." />
          <FeatureCard icon={<ShieldCheck className="size-5" />} title="Security controls" description="PINs, booking validations, and time restrictions keep every trip in policy." />
          <FeatureCard icon={<Smartphone className="size-5" />} title="Multiple booking methods" description="Web Booker, the Lynk app, and a dedicated business phone line, all reconciled to one account." />
        </div>
      </section>

      <PaymentPlans />

      <CTABand
        title="Ready to get started?"
        description="Register for free in minutes, or talk to our team about the right setup for your business."
        primary={{ label: 'Register for Free', to: '/register' }}
        secondary={{ label: 'Get a Demo', to: '/get-demo' }}
      />
    </div>
  )
}
