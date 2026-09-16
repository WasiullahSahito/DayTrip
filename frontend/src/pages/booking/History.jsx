import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { History as HistoryIcon, ChevronRight, RotateCcw } from 'lucide-react'
import clsx from 'clsx'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { STATUS_META } from '../../components/booking/statusMeta'
import * as bookingService from '../../services/bookingService'
import { formatDateTime, formatCurrency } from '../../utils/format'

const FILTERS = ['All', 'Completed', 'Cancelled']

export default function History() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState(null)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    bookingService.getHistory().then(setBookings)
  }, [])

  const filtered = (bookings || []).filter((b) => {
    if (filter === 'Completed') return !b.cancelled
    if (filter === 'Cancelled') return b.cancelled
    return true
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-extrabold text-ink">Booking history</h1>
      <p className="text-sm text-ink-soft">Review your past trips and rebook in a tap.</p>

      <div className="mt-5 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer',
              filter === f ? 'bg-ink text-white' : 'bg-surface-muted text-ink-soft hover:text-ink'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {bookings === null &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}

        {bookings !== null && filtered.length === 0 && (
          <EmptyState
            icon={<HistoryIcon className="size-6" />}
            title="No bookings yet"
            description="Your completed and cancelled trips will show up here."
            action={
              <Button size="sm" onClick={() => navigate('/app/home')}>
                Book a ride
              </Button>
            }
          />
        )}

        {filtered.map((b) => {
          const { status } = bookingService.computeLiveStatus(b)
          const meta = STATUS_META[status]
          return (
            <Card key={b.id} className="!p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={meta.tone === 'primary' ? 'primary' : meta.tone}>{meta.label}</Badge>
                    <span className="text-xs text-ink-soft">{formatDateTime(b.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 truncate text-sm font-bold text-ink">
                    {b.pickup.label} &rarr; {b.destination.label}
                  </p>
                  <p className="text-xs text-ink-soft">{b.vehicle.name} &middot; #{b.reference}</p>
                </div>
                <p className="shrink-0 font-extrabold text-ink">{formatCurrency(b.fare)}</p>
              </div>
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<RotateCcw className="size-3.5" />}
                  onClick={() => navigate('/app/home', { state: { rebook: b } })}
                >
                  Rebook
                </Button>
                <Link to={`/app/active/${b.id}`} className="ml-auto">
                  <Button size="sm" variant="ghost" icon={<ChevronRight className="size-3.5" />}>
                    Details
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
