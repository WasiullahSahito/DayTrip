import { Navigate, Outlet, useLocation } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import BottomNav from '../components/layout/BottomNav'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'

// /app/home is reachable while signed out — it's the guest booking entry
// point that Landing and Fare Estimator send a signed-out visitor straight
// to (see their "Book a ride" / "Continue to book" buttons), instead of a
// separate signup page. NewBooking creates the account transparently, with
// no password, the moment a guest actually submits a booking. Every other
// /app/* route still requires a real session.
const GUEST_ALLOWED_PATH = '/app/home'

export default function AppLayout() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading your account…" />
      </div>
    )
  }

  if (status === 'unauthenticated' && location.pathname !== GUEST_ALLOWED_PATH) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <AppHeader />
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
