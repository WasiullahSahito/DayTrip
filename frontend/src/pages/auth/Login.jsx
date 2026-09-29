import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { isValidEmail, isNotEmpty } from '../../utils/validators'

export default function Login() {
  usePageMeta('Log In | DayTrip', 'Log in to your DayTrip account to book and manage your rides.')
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const rebook = location.state?.rebook

  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const next = {}
    if (!isValidEmail(form.email)) next.email = 'Please enter a valid email address'
    if (!isNotEmpty(form.password)) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!validate()) return
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate('/app/home', rebook ? { state: { rebook } } : undefined)
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-extrabold text-ink">Welcome back</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Log in to book and manage your rides.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          icon={<Mail className="size-4.5" />}
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          icon={<Lock className="size-4.5" />}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        {formError && (
          <p className="rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger animate-slide-down">
            {formError}
          </p>
        )}

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary/50"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-semibold text-ink hover:underline">
            Lost your password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Log in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold text-ink-soft">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        fullWidth
        size="lg"
        className="!rounded-full !border-2 !border-primary"
        onClick={() => navigate('/app/home', rebook ? { state: { rebook } } : undefined)}
      >
        Continue As Guest
      </Button>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Don’t have an account?{' '}
        <Link to="/register" className="font-semibold text-ink hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
