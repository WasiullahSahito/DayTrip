import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | unauthenticated

  useEffect(() => {
    let cancelled = false
    authService.getCurrentUser().then((u) => {
      if (cancelled) return
      setUser(u)
      setStatus(u ? 'authenticated' : 'unauthenticated')
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function handleAuthExpired() {
      setUser(null)
      setStatus('unauthenticated')
    }

    window.addEventListener('lynk:auth-expired', handleAuthExpired)
    return () => window.removeEventListener('lynk:auth-expired', handleAuthExpired)
  }, [])

  const login = useCallback(async (credentials) => {
    const u = await authService.login(credentials)
    setUser(u)
    setStatus('authenticated')
    return u
  }, [])

  const register = useCallback(async (payload) => {
    const u = await authService.register(payload)
    setUser(u)
    setStatus('authenticated')
    return u
  }, [])

  const guestCheckout = useCallback(async (payload) => {
    const u = await authService.guestCheckout(payload)
    setUser(u)
    setStatus('authenticated')
    return u
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const updateProfile = useCallback(
    async (updates) => {
      const u = await authService.updateProfile(user.id, updates)
      setUser(u)
      return u
    },
    [user]
  )

  return (
    <AuthContext.Provider value={{ user, status, login, register, guestCheckout, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- co-locating the hook keeps auth state and its accessor in one place
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
