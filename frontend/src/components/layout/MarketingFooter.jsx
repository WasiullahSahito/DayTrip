import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'
import Logo from './Logo'

export default function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-5">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            Book your taxi online with an easy-to-use web booker. Manage bookings, track your
            taxi, and handle all your transport needs from any device.
          </p>
        </div>

        <FooterColumn
          title="Business"
          links={[
            { label: 'Business', to: '/business' },
            { label: 'Corporate', to: '/business/corporate' },
            { label: 'Healthcare', to: '/business/healthcare' },
            { label: 'Hospitality', to: '/business/hospitality' },
            { label: 'Public Sector', to: '/public-sector' },
            { label: 'Business Blog', to: '/business/blog' },
            { label: 'Get Demo', to: '/get-demo' },
          ]}
        />
        <FooterColumn
          title="Personal"
          links={[
            { label: 'Taxi', to: '/#personal' },
            { label: 'Book Now', to: '/book' },
          ]}
        />
        <FooterColumn
          title="Services"
          links={[
            { label: 'Airport Taxi', to: '/business/airport-transfers' },
            { label: 'Fare Estimator', to: '/business/fare-estimator' },
            { label: 'QR Taxi Booker', to: '/business/qr-booker' },
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            { label: 'Home', to: '/' },
            { label: 'Our Story', to: '/company/our-story' },
            { label: 'Contact Us', to: '/contact' },
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Cookie Policy', to: '/cookie-policy' },
            { label: 'Terms & Conditions', to: '/terms' },
          ]}
        />
      </div>
      <div className="border-t border-border px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Lynk Clone — an unofficial UI/UX recreation built for demonstration purposes.</span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" /> (01) 820 2020
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5" /> customercare@lynk.ie
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" /> Dublin, Ireland
            </span>
          </span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-ink">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-ink-soft hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
