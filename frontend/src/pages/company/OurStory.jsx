import { usePageMeta } from '../../hooks/usePageMeta'
import ContactCTA from '../../components/common/ContactCTA'

const MILESTONES = [
  { year: '2013', title: 'Lynk is founded', desc: 'Started in Dublin with a simple goal: make booking a taxi as easy as making a phone call.' },
  { year: '2017', title: 'Web Booker launches', desc: 'Passengers and businesses could book from a browser for the first time, no app required.' },
  { year: '2020', title: 'Business accounts arrive', desc: 'Corporate, healthcare, hospitality, and public-sector organisations get dedicated tools.' },
  { year: '2024', title: 'QR Taxi Booker', desc: 'Hotels and venues start placing scannable codes to book guest transport instantly.' },
]

export default function OurStory() {
  usePageMeta('Our Story | Lynk', 'How Lynk grew from a Dublin taxi dispatcher into a full booking platform for individuals and businesses.')

  return (
    <div>
      <section className="bg-ink py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Our story</h1>
          <p className="mt-4 text-white/70">
            From a Dublin taxi dispatcher to a full booking platform — here's how we got here.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="space-y-8 border-l-2 border-border pl-8">
          {MILESTONES.map((m) => (
            <div key={m.year} className="relative">
              <span className="absolute -left-[41px] flex size-5 items-center justify-center rounded-full bg-primary ring-4 ring-white" />
              <p className="text-sm font-bold text-primary-dark">{m.year}</p>
              <h3 className="mt-1 text-lg font-bold text-ink">{m.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <ContactCTA title="Want to be part of the next chapter?" description="Register as a rider, set up a business account, or just say hello." />
    </div>
  )
}
