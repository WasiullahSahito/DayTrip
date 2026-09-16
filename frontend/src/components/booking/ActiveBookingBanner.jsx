import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Car, ChevronRight } from 'lucide-react'
import * as bookingService from '../../services/bookingService'
import { STATUS_META } from './statusMeta'
import Badge from '../ui/Badge'

export default function ActiveBookingBanner() {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    let mounted = true
    const refresh = () => bookingService.getActiveBookings().then((b) => mounted && setBookings(b)).catch(() => {})

    refresh()
    const interval = setInterval(() => {
      refresh()
    }, 5000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (bookings.length === 0) return null

  return (
    <div className="mb-5 space-y-2.5 animate-fade-in">
      {bookings.map((b) => {
        const { status } = bookingService.computeLiveStatus(b)
        const meta = STATUS_META[status]
        return (
          <Link
            key={b.id}
            to={`/app/active/${b.id}`}
            className="flex items-center gap-3.5 rounded-2xl border border-primary/40 bg-primary-lighter/40 p-4 hover:bg-primary-lighter/60"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink text-primary">
              <Car className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <Badge tone={meta.tone === 'primary' ? 'primary' : meta.tone}>{meta.label}</Badge>
                <span className="text-xs font-semibold text-ink-soft">#{b.reference}</span>
              </span>
              <span className="mt-1 block truncate text-sm font-semibold text-ink">
                {b.pickup.label} &rarr; {b.destination.label}
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-ink-soft" />
          </Link>
        )
      })}
    </div>
  )
}
