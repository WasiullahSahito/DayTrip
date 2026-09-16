import { usePageMeta } from '../hooks/usePageMeta'
import LegalPage from './LegalPage'

export default function Terms() {
  usePageMeta('Terms & Conditions | Lynk', 'The terms and conditions for using the Lynk taxi booking platform.')
  return (
    <LegalPage title="Terms &amp; Conditions" updated="January 2026">
      <p>
        These terms are placeholder content for demonstration purposes as part of a UI/UX clone
        project and do not constitute a real legal agreement.
      </p>
      <Section title="1. Using our service">
        By creating an account and booking a journey through this platform, you agree to provide
        accurate pickup, destination, and passenger information for each trip.
      </Section>
      <Section title="2. Fares &amp; payment">
        Fare estimates shown before booking are indicative. The final fare may vary based on
        route, traffic, and journey duration, and will be charged via your selected payment
        method.
      </Section>
      <Section title="3. Cancellations">
        Bookings may be cancelled free of charge before a driver is assigned. A cancellation fee
        may apply once a driver is en route to your pickup location.
      </Section>
      <Section title="4. Account responsibility">
        You are responsible for maintaining the confidentiality of your account credentials and
        for all activity that occurs under your account.
      </Section>
    </LegalPage>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-1.5 font-bold text-ink">{title}</h2>
      <p>{children}</p>
    </div>
  )
}
