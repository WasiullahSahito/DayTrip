import { usePageMeta } from '../hooks/usePageMeta'
import LegalPage from './LegalPage'

export default function CookiePolicy() {
  usePageMeta('Cookie Policy | Lynk', 'How Lynk uses cookies to keep you signed in and improve the booking experience.')

  return (
    <LegalPage title="Cookie Policy" updated="January 2026">
      <p>
        This cookie notice is placeholder content for demonstration purposes as part of a UI/UX
        clone project.
      </p>
      <Section title="Essential cookies">
        Used to keep you signed in and remember your booking in progress. These can't be switched
        off, as the site won't function correctly without them.
      </Section>
      <Section title="Preference cookies">
        Remember choices like your default pickup address or preferred vehicle type across visits.
      </Section>
      <Section title="Managing cookies">
        You can clear cookies at any time from your browser settings. Doing so may sign you out
        and reset saved preferences.
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
