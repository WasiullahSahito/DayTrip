import { Building2, HeartPulse, Hotel, Landmark } from 'lucide-react'

// Single source of truth for sector identity + cross-navigation, per the
// "Solutions for Every Sector" component used across /business and each
// sector page. Richer page content lives in sectorContent.js.
export const SECTORS = [
  {
    id: 'corporate',
    title: 'Corporate',
    subtitle: 'Business Travel',
    description: 'Employee travel, airport transfers, and corporate events — booked and billed centrally.',
    route: '/business/corporate',
    icon: Building2,
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    subtitle: 'Patient Transport',
    description: 'Patient appointments, carer transportation, and equipment delivery, with priority booking.',
    route: '/business/healthcare',
    icon: HeartPulse,
  },
  {
    id: 'hospitality',
    title: 'Hospitality',
    subtitle: 'Guest Bookings',
    description: 'Book taxis for hotel and venue guests in seconds, no app download required.',
    route: '/business/hospitality',
    icon: Hotel,
  },
  {
    id: 'public-sector',
    title: 'Public Sector',
    subtitle: 'Government Transport',
    description: 'Cost-efficient, accountable transport for government offices and public bodies.',
    route: '/public-sector',
    icon: Landmark,
  },
]

export function getSector(id) {
  return SECTORS.find((s) => s.id === id)
}
