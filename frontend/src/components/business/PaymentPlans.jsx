import SectionTitle from '../common/SectionTitle'
import PaymentPlanCard from '../common/PaymentPlanCard'
import { PROFILE_TYPES } from '../../data/profileTypes'

export default function PaymentPlans({ id = 'plans', muted = true }) {
  return (
    <section id={id} className={`py-20 scroll-mt-20 ${muted ? 'bg-surface-muted' : ''}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Payment options"
          title="An account for every kind of business"
          description="Pay as you go, or invoice monthly — choose the account that fits how your team spends."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PROFILE_TYPES.map((plan) => (
            <PaymentPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  )
}
