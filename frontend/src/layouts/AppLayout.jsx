import { Navigate, Outlet } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import BottomNav from '../components/layout/BottomNav'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'

export default function AppLayout() {
  const { status } = useAuth()

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
