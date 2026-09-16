import { Wallet, FileText, KeyRound, ShieldCheck, Clock, Users } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import SectionTitle from '../../components/common/SectionTitle'
import FeatureCard from '../../components/common/FeatureCard'
import PaymentPlans from '../../components/business/PaymentPlans'
import SecuritySection from '../../components/business/SecuritySection'
import ContactCTA from '../../components/common/ContactCTA'

export default function PaymentOptions() {
  usePageMeta('Business Payment Options | Lynk', 'Card-Pay, Bill-Pay, and contract accounts for Lynk Business — with PINs, validations, and time restrictions.')

  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 pt-16 pb-6 text-center sm:px-6">
        <SectionTitle
          as="h1"
          eyebrow="Payment options"
          title="Pay as you go, or invoice monthly"
          description="Every business account can pay by card at the time of booking, or move to invoiced billing as the team grows."
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={<Wallet className="size-5" />} title="Card-Pay" description="Pay as you go on Business — each trip is charged to a company card automatically." />
          <FeatureCard icon={<FileText className="size-5" />} title="Bill-Pay" description="Book now, pay later on Business+ with weekly or monthly consolidated invoicing." />
          <FeatureCard icon={<Users className="size-5" />} title="Contract accounts" description="High-volume organisations can arrange a contract account with a dedicated manager." />
        </div>
      </section>

      <PaymentPlans />

      <SecuritySection />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <SectionTitle align="left" eyebrow="Fine-grained control" title="Set the rules once, every booking follows them" className="mx-0 max-w-none" />
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <FeatureCard icon={<KeyRound className="size-5" />} title="PINs" description="Require a security PIN at pickup to confirm the right passenger travelled." />
          <FeatureCard icon={<ShieldCheck className="size-5" />} title="Validations" description="Restrict bookings to approved addresses or cost centres." />
          <FeatureCard icon={<Clock className="size-5" />} title="Time restrictions" description="Limit when an account can book, to keep spend inside policy hours." />
        </div>
      </section>

      <ContactCTA title="Want to talk through billing options?" description="Our team can walk you through Card-Pay, Bill-Pay, and contract accounts." />
    </div>
  )
}
