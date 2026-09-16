import { useEffect, useState } from 'react'
import { BarChart3, Download } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import * as bookingService from '../../services/bookingService'
import { formatCurrency, formatDate } from '../../utils/format'

export default function Reports() {
  const { user } = useAuth()
  const toast = useToast()
  const [bookings, setBookings] = useState(null)

  useEffect(() => {
    bookingService.getHistory().then((h) => setBookings(h.filter((b) => !b.cancelled)))
  }, [])

  const total = (bookings || []).reduce((sum, b) => sum + b.fare, 0)

  if (user.accountType === 'personal') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="font-semibold text-ink">Reports are available on Business accounts</p>
        <p className="mt-1 text-sm text-ink-soft">Upgrade your account to unlock expense reporting.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Reports</h1>
          <p className="text-sm text-ink-soft">Expense summary across all completed trips.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          icon={<Download className="size-4" />}
          onClick={() => toast.info('CSV export is disabled in this demo.')}
        >
          Export CSV
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="!p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Total trips</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">{bookings?.length ?? '—'}</p>
        </Card>
        <Card className="!p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Total spend</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">{formatCurrency(total)}</p>
        </Card>
        <Card className="!p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Avg. fare</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {formatCurrency(bookings?.length ? total / bookings.length : 0)}
          </p>
        </Card>
      </div>

      <Card className="mt-4 !p-0 overflow-hidden">
        {bookings === null && (
          <div className="space-y-2 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {bookings !== null && bookings.length === 0 && (
          <div className="p-5">
            <EmptyState icon={<BarChart3 className="size-6" />} title="No completed trips yet" description="Your booking expenses will appear here." />
          </div>
        )}

        {bookings !== null && bookings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs font-bold uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Passenger</th>
                  <th className="px-5 py-3">Route</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3 text-right">Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-ink-soft">{formatDate(b.createdAt)}</td>
                    <td className="px-5 py-3 font-medium text-ink">{b.passengerName}</td>
                    <td className="max-w-xs truncate px-5 py-3 text-ink-soft">
                      {b.pickup.label} &rarr; {b.destination.label}
                    </td>
                    <td className="px-5 py-3 text-ink-soft">#{b.reference}</td>
                    <td className="px-5 py-3 text-right font-bold text-ink">{formatCurrency(b.fare)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
