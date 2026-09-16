import {
  Briefcase,
  Plane,
  CalendarDays,
  Users,
  Package,
  Smartphone,
  Phone,
  Globe,
  FileText,
  Wallet,
  Stethoscope,
  Ambulance,
  ClipboardList,
  UserRoundPlus,
  Siren,
  Headset,
  Accessibility,
  BedDouble,
  QrCode,
  Bell,
  Luggage,
  Handshake,
  Landmark,
  ShieldCheck,
  KeyRound,
  Clock,
  BarChart3,
} from 'lucide-react'

// Rich per-sector page content. Keyed by the same ids used in data/sectors.js.
// Informed by lynk.ie's real business/corporate/healthcare/hospitality/public-sector
// pages, written as original copy rather than copied verbatim.
export const SECTOR_CONTENT = {
  corporate: {
    key: 'corporate',
    eyebrow: 'For Business',
    heroTitle: 'Corporate convenience, built in',
    heroDescription:
      'From employee commutes to airport transfers and client events, give your team a single, accountable way to book taxis — on the web, in the app, or by phone.',
    heroBullets: ['Employee travel & airport transfers', 'Corporate events & guest bookings', 'Centralised billing, no expense claims'],
    primaryCta: { label: 'Register for Free', to: '/register' },
    secondaryCta: { label: 'Get Demo', to: '/get-demo' },
    features: [
      { icon: Briefcase, title: 'Employee travel', desc: 'Everyday commutes and client meetings, booked in seconds and billed to the company account.' },
      { icon: Plane, title: 'Airport transfers', desc: 'Reliable pickups and drop-offs for travelling staff, with flight-aware scheduling.' },
      { icon: CalendarDays, title: 'Corporate events', desc: 'Coordinate transport for conferences, offsites, and client entertainment from one dashboard.' },
      { icon: Users, title: 'Guest bookings', desc: 'Book taxis on behalf of visitors and clients without sharing your personal account.' },
      { icon: Package, title: 'Package delivery', desc: 'Send documents or parcels across the city with the same taxi network you already trust.' },
      { icon: Smartphone, title: 'Book anywhere', desc: 'Web Booker, the DayTrip app, or a phone call — every channel lands in the same account.' },
    ],
    benefits: [
      { icon: FileText, title: 'Expense reports', desc: 'Itemised, exportable statements replace paper receipts and manual claims.' },
      { icon: Wallet, title: 'Flexible payment', desc: 'Pay-as-you-go on Business, or invoice on Business+ — your call.' },
      { icon: Globe, title: 'Every channel', desc: 'Web, app, and 24/7 phone booking are all included as standard.' },
      { icon: Phone, title: 'Priority support', desc: 'A dedicated business line when your team needs a human, fast.' },
    ],
    showSecurity: true,
    showQr: false,
    ctaBand: {
      title: 'Set up your business account today',
      description: 'Free to register — add users, set spending controls, and start booking in minutes.',
      primary: { label: 'Register for Free', to: '/register' },
      secondary: { label: 'Talk to sales', to: '/get-demo' },
    },
  },

  healthcare: {
    key: 'healthcare',
    eyebrow: 'For Healthcare',
    heroTitle: 'Patient and carer transportation, done right',
    heroDescription:
      'Coordinate non-emergency patient transport, carer journeys, and equipment delivery with priority booking and full visibility over every trip.',
    heroBullets: ['Patient appointments & discharge transport', 'Carer & visitor bookings', 'Wheelchair-accessible vehicles on request'],
    primaryCta: { label: 'Register for Free', to: '/register' },
    secondaryCta: { label: 'Apply Here', to: '/get-demo' },
    features: [
      { icon: Stethoscope, title: 'Patient appointments', desc: 'Reliable transport to and from outpatient appointments, booked well ahead of time.' },
      { icon: UserRoundPlus, title: 'Carer transportation', desc: 'Get carers and support workers where they need to be, on a predictable schedule.' },
      { icon: Ambulance, title: 'Equipment delivery', desc: 'Move medical equipment and supplies between sites without disrupting your fleet.' },
      { icon: Users, title: 'Visitor bookings', desc: 'Arrange taxis for patient visitors directly from reception, no app required.' },
      { icon: Siren, title: 'Emergency services', desc: 'Fast-tracked, non-emergency call-outs when a bed needs to move quickly.' },
      { icon: Accessibility, title: 'Accessible vehicles', desc: 'Wheelchair-accessible taxis with ramps and restraints, available on request.' },
    ],
    benefits: [
      { icon: FileText, title: 'Expense reporting', desc: 'Every journey is logged and itemised for department-level reporting.' },
      { icon: Clock, title: 'Priority queues', desc: 'Healthcare bookings are prioritised in the dispatch queue at busy times.' },
      { icon: Headset, title: 'Business hotline', desc: 'A dedicated phone line for staff who need to book without logging in.' },
      { icon: ShieldCheck, title: 'Booking security', desc: 'Role-based access keeps patient journey details visible only to those who need them.' },
    ],
    showSecurity: false,
    showQr: false,
    ctaBand: {
      title: 'Bring reliable transport to your care team',
      description: 'From single clinics to hospital trusts — set up an account that fits your service.',
      primary: { label: 'Register for Free', to: '/register' },
      secondary: { label: 'Apply for an account', to: '/get-demo' },
    },
  },

  hospitality: {
    key: 'hospitality',
    eyebrow: 'For Hospitality',
    heroTitle: 'Easily book taxis for guests and visitors',
    heroDescription:
      'Hotels, B&Bs, and guesthouses use DayTrip to arrange guest transport in seconds — no app download, no waiting on hold, no extra work for reception.',
    heroBullets: ['Guest bookings from reception in seconds', 'QR codes guests can scan themselves', 'Airport meet & greet for arrivals'],
    primaryCta: { label: 'Get Web Booker', to: '/register' },
    secondaryCta: { label: 'Get Demo', to: '/get-demo' },
    features: [
      { icon: BedDouble, title: 'Guest bookings', desc: 'Book a taxi for any guest directly from the Web Booker — no phone queue required.' },
      { icon: ClipboardList, title: 'Booking templates', desc: 'Save common journeys (airport, station, city centre) for one-tap rebooking.' },
      { icon: Bell, title: 'Guest notifications', desc: 'Guests get live status updates by SMS, so reception isn’t fielding "where’s my taxi?" calls.' },
      { icon: QrCode, title: 'QR Taxi Booker', desc: 'Place a QR code at reception or in rooms — guests scan and book without an app.' },
      { icon: Plane, title: 'Airport meet & greet', desc: 'Arrange a driver waiting at arrivals for VIP guests, with flight tracking.' },
      { icon: Luggage, title: 'Room for luggage', desc: 'Multi-seater vehicles with large boot capacity for groups and heavy bags.' },
    ],
    benefits: [
      { icon: Headset, title: 'Less reception workload', desc: 'No more holding the phone line while a guest waits — book and move on.' },
      { icon: Smartphone, title: 'No download needed', desc: 'The QR Booker works entirely in the browser — nothing for guests to install.' },
      { icon: Handshake, title: 'Guest experience', desc: 'Friendly, professional drivers reflect well on your property.' },
      { icon: Users, title: 'Any group size', desc: 'From a solo traveller to a wedding party, there’s a vehicle that fits.' },
    ],
    showSecurity: false,
    showQr: true,
    ctaBand: {
      title: 'Give guests a better way to travel',
      description: 'Set up Web Booker and a QR code at reception in one short call.',
      primary: { label: 'Get Web Booker', to: '/register' },
      secondary: { label: 'See the QR Booker', to: '/business/qr-booker' },
    },
  },

  'public-sector': {
    key: 'public-sector',
    eyebrow: 'For Public Sector',
    heroTitle: 'Smart, flexible transport tailored for the public sector',
    heroDescription:
      'Government offices and public bodies use DayTrip for cost-efficient, accountable transport — with the security controls procurement expects.',
    heroBullets: ['Auditable, itemised billing', 'PIN-protected & time-restricted bookings', 'Phone, web, and app booking channels'],
    primaryCta: { label: 'Get DayTrip', to: '/register' },
    secondaryCta: { label: 'Apply Here', to: '/get-demo' },
    features: [
      { icon: Landmark, title: 'Cost efficiency', desc: 'Consolidated invoicing and transparent fares make budgeting straightforward.' },
      { icon: Clock, title: 'Flexible booking', desc: 'Book ahead for scheduled visits or on-demand for same-day travel needs.' },
      { icon: ShieldCheck, title: 'Security & access', desc: 'Restrict who can book, when, and for what, at an account or user level.' },
      { icon: BarChart3, title: 'Accountability', desc: 'Every trip is logged and reportable — ready for audit at any time.' },
      { icon: Users, title: 'Priority clients', desc: 'Frequent-use accounts get priority dispatch at peak times.' },
      { icon: Phone, title: 'Every channel', desc: 'Phone, Web Booker, and app booking, all reconciled to one account.' },
    ],
    benefits: [
      { icon: FileText, title: 'Itemised reporting', desc: 'Export trip-level data for finance and procurement review.' },
      { icon: KeyRound, title: 'Security PINs', desc: 'Require a PIN at pickup to confirm the right passenger travelled.' },
      { icon: Clock, title: 'Time restrictions', desc: 'Limit bookings to approved hours to control out-of-policy spend.' },
      { icon: Accessibility, title: 'Accessible vehicles', desc: 'Wheelchair-accessible taxis available across the fleet.' },
    ],
    showSecurity: true,
    showQr: false,
    ctaBand: {
      title: 'Bring accountable transport to your office',
      description: 'Set up a public-sector account with the controls your procurement team needs.',
      primary: { label: 'Get DayTrip', to: '/register' },
      secondary: { label: 'Apply for an account', to: '/get-demo' },
    },
  },
}

export const SECURITY_OPTIONS = [
  { icon: KeyRound, title: 'Security PINs', desc: 'Require a PIN at pickup so only the intended passenger can travel on the account.' },
  { icon: ShieldCheck, title: 'Booking validations', desc: 'Restrict bookings to approved addresses, cost centres, or user groups.' },
  { icon: Clock, title: 'Time restrictions', desc: 'Limit when an account can book, to keep spend inside policy hours.' },
]
