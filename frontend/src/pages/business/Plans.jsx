import { usePageMeta } from '../../hooks/usePageMeta'
import SectionTitle from '../../components/common/SectionTitle'
import PaymentPlans from '../../components/business/PaymentPlans'
import ContactCTA from '../../components/common/ContactCTA'

export default function Plans() {
  usePageMeta('Business Plans | Lynk', 'Compare Lynk Personal, Business, and Business+ accounts and choose the right fit for your organisation.')

  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 pt-16 pb-4 text-center sm:px-6">
        <SectionTitle
          as="h1"
          eyebrow="Business plans"
          title="Choose the account that fits your business"
          description="Every plan includes web, app, and phone booking. Upgrade or downgrade at any time."
        />
      </section>
      <PaymentPlans id="compare" muted={false} />
      <ContactCTA title="Not sure which plan fits?" description="Tell us about your organisation and we'll recommend the right setup." />
    </div>
  )
}
