import { usePageMeta } from '../hooks/usePageMeta'
import LegalPage from './LegalPage'

export default function Privacy() {
  usePageMeta('Privacy Policy | DayTrip', 'How DayTrip collects, uses, and protects your personal information.')
  return (
    <LegalPage title="Privacy Policy" updated="January 2026">
      <p>
        This privacy notice is placeholder content for demonstration purposes as part of a
        UI/UX clone project.
      </p>
      <Section title="Information we collect">
        Account details (name, email, phone), booking history, favourite addresses, and payment
        method metadata (never full card numbers) needed to provide the service.
      </Section>
      <Section title="How we use it">
        To create bookings, match you with a driver, calculate fares, and provide support when
        you contact us.
      </Section>
      <Section title="Your choices">
        You can update or delete your account information, remove saved addresses and payment
        methods, and request account deletion at any time from your profile.
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
