import { useAuth } from '../../context/AuthContext'
import ActiveBookingBanner from '../../components/booking/ActiveBookingBanner'
import NewBooking from './NewBooking'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const { user } = useAuth()

  return (
    <div>
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <h1 className="text-2xl font-extrabold text-ink">
          {greeting()}, {user?.firstName}
        </h1>
        <p className="text-sm text-ink-soft">Where would you like to go today?</p>
        <div className="mt-5">
          <ActiveBookingBanner />
        </div>
      </div>
      <NewBooking />
    </div>
  )
}
