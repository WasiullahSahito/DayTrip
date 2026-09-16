import { Navigate, Outlet } from 'react-router-dom'
import AdminHeader from '../components/layout/AdminHeader'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'

/**
 * This client-side isAdmin check is UX-only — it just avoids showing a
 * broken page to a non-admin. The real, only enforcement is the backend's
 * EnsureUserIsAdmin middleware, which independently re-checks every
 * /api/admin/* request regardless of what this layout renders.
 */
export default function AdminLayout() {
  const { status, user } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading your account…" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  if (!user?.isAdmin) {
    return <Navigate to="/app/home" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <AdminHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
