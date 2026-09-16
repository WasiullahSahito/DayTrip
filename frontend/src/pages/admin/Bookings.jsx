import { useEffect, useState } from 'react'
import { ClipboardList, Car } from 'lucide-react'
import clsx from 'clsx'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { STATUS_META } from '../../components/booking/statusMeta'
import { useToast } from '../../context/ToastContext'
import * as adminService from '../../services/adminService'
import { formatCurrency, formatDateTime } from '../../utils/format'

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Pending payment', value: 'pending_payment' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const STATUS_OPTIONS = Object.keys(STATUS_META)

export default function Bookings() {
  const toast = useToast()
  const [bookings, setBookings] = useState(null)
  const [filter, setFilter] = useState('')
  const [drivers, setDrivers] = useState([])
  const [assigning, setAssigning] = useState(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-change pattern: flip the loading flag before the async call starts
    setBookings(null)
    const query = filter ? `?status=${filter}` : ''
    adminService.getBookings(query).then((page) => setBookings(page.data))
  }, [filter])
  useEffect(() => {
    adminService.getDrivers('?per_page=50').then((page) => setDrivers(page.data.filter((d) => d.isActive)))
  }, [])

  async function onStatusChange(booking, status) {
    const previous = bookings
    setBookings((list) => list.map((b) => (b.id === booking.id ? { ...b, status } : b)))
    try {
      await adminService.updateBookingStatus(booking.id, status)
      toast.success('Booking status updated.')
    } catch (err) {
      setBookings(previous)
      toast.error(err.message || 'Failed to update status.')
    }
  }

  async function onAssignDriver(driverId) {
    try {
      const updated = await adminService.assignDriver(assigning.id, driverId)
      setBookings((list) => list.map((b) => (b.id === updated.id ? updated : b)))
      toast.success('Driver assigned.')
      setAssigning(null)
    } catch (err) {
      toast.error(err.message || 'Failed to assign driver.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-extrabold text-ink">Bookings</h1>
      <p className="text-sm text-ink-soft">View and manage every booking across all customers.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={clsx(
              'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer',
              filter === f.value ? 'bg-ink text-white' : 'bg-surface-muted text-ink-soft hover:text-ink'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {bookings === null && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}

        {bookings !== null && bookings.length === 0 && (
          <EmptyState icon={<ClipboardList className="size-6" />} title="No bookings found" description="Try a different filter." />
        )}

        {bookings?.map((booking) => {
          const meta = STATUS_META[booking.status]
          return (
            <Card key={booking.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={meta?.tone === 'primary' ? 'primary' : meta?.tone || 'neutral'}>{meta?.label || booking.status}</Badge>
                    <span className="text-xs text-ink-soft">{formatDateTime(booking.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 truncate text-sm font-bold text-ink">
                    {booking.pickup.label} &rarr; {booking.destination.label}
                  </p>
                  <p className="text-xs text-ink-soft">
                    #{booking.reference} &middot; {booking.user.name} ({booking.user.email})
                  </p>
                  {booking.driver && (
                    <p className="mt-1 text-xs text-ink-soft">
                      Driver: {booking.driver.name} &middot; {booking.driver.car} &middot; {booking.driver.reg}
                    </p>
                  )}
                </div>
                <p className="shrink-0 font-extrabold text-ink">{formatCurrency(booking.fare)}</p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <select
                  value={booking.status}
                  onChange={(e) => onStatusChange(booking, e.target.value)}
                  className="h-9 rounded-lg border border-border bg-white px-2.5 text-sm font-medium text-ink"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
                <Button size="sm" variant="outline" icon={<Car className="size-3.5" />} onClick={() => setAssigning(booking)}>
                  Assign driver
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal open={!!assigning} onClose={() => setAssigning(null)} title="Assign a driver">
        <div className="space-y-1.5">
          {drivers.length === 0 && <p className="text-sm text-ink-soft">No active drivers available.</p>}
          {drivers.map((driver) => (
            <button
              key={driver.id}
              onClick={() => onAssignDriver(driver.id)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-surface-muted cursor-pointer"
            >
              <span>
                <span className="block text-sm font-semibold text-ink">{driver.name}</span>
                <span className="block text-xs text-ink-soft">{driver.car} &middot; {driver.reg}</span>
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
