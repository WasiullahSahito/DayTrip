import { NavLink } from 'react-router-dom'
import { Car, History, Star, User, LogIn } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'

const ITEMS = [
  { to: '/app/home', label: 'Book', icon: Car },
  { to: '/app/history', label: 'Activity', icon: History },
  { to: '/app/favourites', label: 'Saved', icon: Star },
  { to: '/app/profile', label: 'Account', icon: User },
]

// A guest booking pre-account only has one real page ("Book") — the rest
// require a session they don't have yet, so swap them for a Log in link.
const GUEST_ITEMS = [
  { to: '/app/home', label: 'Book', icon: Car },
  { to: '/login', label: 'Log in', icon: LogIn },
]

export default function BottomNav() {
  const { status } = useAuth()
  const items = status === 'authenticated' ? ITEMS : GUEST_ITEMS

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors',
                isActive ? 'text-ink' : 'text-ink-soft/70'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx(
                    'flex size-8 items-center justify-center rounded-full transition-colors',
                    isActive && 'bg-primary-light'
                  )}
                >
                  <Icon className="size-[19px]" strokeWidth={isActive ? 2.4 : 2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
