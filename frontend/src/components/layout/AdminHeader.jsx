import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Car, ClipboardList, LogOut, ArrowLeft, Truck } from 'lucide-react'
import clsx from 'clsx'
import Logo from './Logo'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
  { to: '/admin/drivers', label: 'Drivers', icon: Car },
  { to: '/admin/vehicle-types', label: 'Vehicle types', icon: Truck },
]

export default function AdminHeader() {
  const { logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    toast.success('You’ve been signed out.')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <NavLink to="/admin">
            <Logo />
          </NavLink>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'bg-primary-light text-ink' : 'text-ink-soft hover:bg-surface-muted hover:text-ink'
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/app/home"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface-muted hover:text-ink sm:flex"
          >
            <ArrowLeft className="size-4" />
            Back to app
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-danger hover:bg-danger-bg cursor-pointer"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
