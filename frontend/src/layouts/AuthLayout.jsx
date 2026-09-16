import { Link, Navigate, Outlet } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '../components/layout/Logo'
import AuthCarousel from '../components/layout/AuthCarousel'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'

export default function AuthLayout() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading…" />
      </div>
    )
  }

  if (status === 'authenticated') {
    return <Navigate to="/app/home" replace />
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10 sm:py-8 lg:px-16">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </div>
        <div className="flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="hidden p-4 lg:block">
        <AuthCarousel />
      </div>
    </div>
  )
}
