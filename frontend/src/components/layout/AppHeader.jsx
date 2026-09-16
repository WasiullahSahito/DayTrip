import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, User, CreditCard, Star, History, LogOut, Phone, Zap, Shield } from 'lucide-react'
import clsx from 'clsx'
import Logo from './Logo'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { initials } from '../../utils/format'

const NAV_LINKS = [
  { to: '/app/home', label: 'Book a ride' },
  { to: '/app/history', label: 'Booking history' },
  { to: '/app/favourites', label: 'Favourites' },
  { to: '/app/quick-bookings', label: 'Quick bookings' },
]

export default function AppHeader() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function handleLogout() {
    await logout()
    toast.success('You’ve been signed out.')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <NavLink to="/app/home">
            <Logo />
          </NavLink>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'bg-primary-light text-ink' : 'text-ink-soft hover:bg-surface-muted hover:text-ink'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:+35318202020"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface-muted hover:text-ink sm:flex"
          >
            <Phone className="size-4" />
            (01) 820 2020
          </a>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-2.5 hover:bg-surface-muted cursor-pointer"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                {initials(`${user?.firstName || ''} ${user?.lastName || ''}`) || <User className="size-4" />}
              </span>
              <ChevronDown className={clsx('size-4 text-ink-soft transition-transform', menuOpen && 'rotate-180')} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-2xl border border-border bg-white p-2 shadow-[var(--shadow-pop)] animate-slide-down">
                <div className="border-b border-border px-3 py-2.5">
                  <p className="truncate text-sm font-bold text-ink">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="truncate text-xs text-ink-soft">{user?.email}</p>
                </div>
                {user?.isAdmin && (
                  <MenuItem to="/admin" icon={<Shield className="size-4" />} label="Admin panel" onClick={() => setMenuOpen(false)} />
                )}
                <MenuItem to="/app/profile" icon={<User className="size-4" />} label="My profile" onClick={() => setMenuOpen(false)} />
                <MenuItem to="/app/payment-methods" icon={<CreditCard className="size-4" />} label="Payment methods" onClick={() => setMenuOpen(false)} />
                <MenuItem to="/app/favourites" icon={<Star className="size-4" />} label="Favourite addresses" onClick={() => setMenuOpen(false)} />
                <MenuItem to="/app/history" icon={<History className="size-4" />} label="Booking history" onClick={() => setMenuOpen(false)} />
                {user?.accountType !== 'personal' && (
                  <MenuItem to="/app/reports" icon={<Zap className="size-4" />} label="Reports" onClick={() => setMenuOpen(false)} />
                )}
                <button
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger-bg cursor-pointer"
                >
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function MenuItem({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted"
    >
      {icon}
      {label}
    </NavLink>
  )
}
