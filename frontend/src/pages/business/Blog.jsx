import { Link } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import SectionTitle from '../../components/common/SectionTitle'
import Card from '../../components/ui/Card'
import ContactCTA from '../../components/common/ContactCTA'

const POSTS = [
  {
    title: 'How to cut employee travel costs without cutting corners',
    excerpt: 'Five ways centralised billing and account controls keep business travel spend predictable.',
    date: 'January 2026',
    tag: 'Corporate',
  },
  {
    title: 'A hotel front desk\'s guide to guest transport',
    excerpt: 'Why more properties are replacing the phone queue with a QR code at reception.',
    date: 'December 2025',
    tag: 'Hospitality',
  },
  {
    title: 'What procurement teams should ask before choosing a taxi partner',
    excerpt: 'Security PINs, audit trails, and time restrictions — the controls public bodies look for.',
    date: 'November 2025',
    tag: 'Public Sector',
  },
]

export default function Blog() {
  usePageMeta('Business Blog | DayTrip', 'Insights on business travel, guest transport, and account management from the DayTrip Business team.')

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <SectionTitle as="h1" eyebrow="Business Blog" title="Insights for business travel" description="Practical guidance for teams managing transport at scale." />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((post) => (
          <Card key={post.title} className="flex h-full flex-col !p-6">
            <span className="inline-flex w-fit items-center rounded-full bg-primary-light px-2.5 py-1 text-xs font-bold text-ink">
              {post.tag}
            </span>
            <h3 className="mt-4 flex-1 text-lg font-bold text-ink">{post.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
            <span className="mt-4 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
              <Calendar className="size-3.5" /> {post.date}
            </span>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="font-semibold text-ink">More articles are on the way</p>
        <p className="mt-1 text-sm text-ink-soft">
          In the meantime, our team is happy to answer questions directly.
        </p>
        <Link to="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink hover:underline">
          Contact us <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-16">
        <ContactCTA />
      </div>
    </div>
  )
}
