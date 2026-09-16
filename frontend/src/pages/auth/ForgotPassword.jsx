import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ChevronLeft, MailCheck } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { isValidEmail } from '../../utils/validators'
import * as authService from '../../services/authService'

export default function ForgotPassword() {
  usePageMeta('Forgot Password | Lynk', 'Reset the password for your Lynk account.')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    setError('')
    setLoading(true)
    await authService.requestPasswordReset(email)
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-bg text-success">
          <MailCheck className="size-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-ink">Check your email</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          If an account exists for <strong className="text-ink">{email}</strong>, we’ve sent a
          link to reset your password.
        </p>
        <Link to="/login">
          <Button variant="outline" fullWidth className="mt-6">
            Back to log in
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Link to="/login" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="size-4" /> Back to log in
      </Link>
      <h1 className="text-2xl font-extrabold text-ink">Forgot your password?</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Enter your email and we’ll send you a link to reset it.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          icon={<Mail className="size-4.5" />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          error={error}
          autoComplete="email"
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Send reset link
        </Button>
      </form>
    </div>
  )
}
