import { useEffect, useState } from 'react'
import { ClipboardList, Car, Users, Euro } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { STATUS_META } from '../../components/booking/statusMeta'
import * as adminService from '../../services/adminService'
import { formatCurrency } from '../../utils/format'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminService.getStats().then(setStats)
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-extrabold text-ink">Dashboard</h1>
      <p className="text-sm text-ink-soft">An overview of bookings, drivers, and revenue.</p>

      {stats === null ? (
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={<ClipboardList className="size-5" />} label="Total bookings" value={stats.totalBookings} />
            <StatCard icon={<Car className="size-5" />} label="Active drivers" value={`${stats.activeDrivers} / ${stats.totalDrivers}`} />
            <StatCard icon={<Users className="size-5" />} label="Total users" value={stats.totalUsers} />
            <StatCard icon={<Euro className="size-5" />} label="Revenue today" value={formatCurrency(stats.revenueToday)} />
          </div>

          <Card className="mt-5">
            <h2 className="font-bold text-ink">Bookings by status</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(stats.bookingsByStatus).length === 0 && (
                <p className="text-sm text-ink-soft">No bookings yet.</p>
              )}
              {Object.entries(stats.bookingsByStatus).map(([status, count]) => {
                const meta = STATUS_META[status]
                return (
                  <Badge key={status} tone={meta?.tone === 'primary' ? 'primary' : meta?.tone || 'neutral'}>
                    {meta?.label || status}: {count}
                  </Badge>
                )
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <Card>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary-lighter text-ink">{icon}</span>
      <p className="mt-3 text-2xl font-extrabold text-ink">{value}</p>
      <p className="text-sm text-ink-soft">{label}</p>
    </Card>
  )
}
