import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, ChevronLeft, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import { usePageMeta } from '../../hooks/usePageMeta'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useToast } from '../../context/ToastContext'
import { minLength, passwordStrength } from '../../utils/validators'
import * as authService from '../../services/authService'

export default function ResetPassword() {
  usePageMeta('Reset Password | Lynk', 'Choose a new password for your Lynk account.')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const strength = passwordStrength(password)

  if (!token || !email) {
    return (
      <div className="animate-fade-in text-center">
        <h1 className="text-2xl font-extrabold text-ink">This reset link is invalid</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Please request a new password reset link.
        </p>
        <Link to="/forgot-password">
          <Button variant="outline" fullWidth className="mt-6">
            Request a new link
          </Button>
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="animate-fade-in text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-bg text-success">
          <CheckCircle2 className="size-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-ink">Password updated</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          You can now log in with your new password.
        </p>
        <Button fullWidth className="mt-6" onClick={() => navigate('/login')}>
          Back to log in
        </Button>
      </div>
    )
  }

  async function onSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!minLength(password, 8)) next.password = 'Use at least 8 characters'
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    if (Object.keys(next).length) return

    setFormError('')
    setLoading(true)
    try {
      await authService.resetPassword({ token, email, password })
      setDone(true)
      toast.success('Password reset successfully.')
    } catch (err) {
      setFormError(err.message || 'This reset link may have expired. Please request a new one.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <Link to="/login" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="size-4" /> Back to log in
      </Link>
      <h1 className="text-2xl font-extrabold text-ink">Choose a new password</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Resetting the password for {email}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <Input
            label="New password"
            type="password"
            icon={<Lock className="size-4.5" />}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((err) => ({ ...err, password: undefined }))
            }}
            error={errors.password}
            autoComplete="new-password"
          />
          {password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={clsx(
                      'h-full flex-1 rounded-full transition-colors',
                      i < strength.score ? (strength.score <= 1 ? 'bg-danger' : strength.score <= 2 ? 'bg-tertiary' : 'bg-success') : 'bg-border'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-ink-soft">{strength.label}</span>
            </div>
          )}
        </div>
        <Input
          label="Confirm new password"
          type="password"
          icon={<Lock className="size-4.5" />}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            setErrors((err) => ({ ...err, confirmPassword: undefined }))
          }}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        {formError && (
          <p className="rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger animate-slide-down">
            {formError}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Reset password
        </Button>
      </form>
    </div>
  )
}
