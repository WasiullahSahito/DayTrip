import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Check, User, Building2, Briefcase, Mail, Lock, ChevronLeft } from 'lucide-react'
import clsx from 'clsx'
import { usePageMeta } from '../../hooks/usePageMeta'
import Input from '../../components/ui/Input'
import PhoneField from '../../components/ui/PhoneField'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { isValidEmail, isValidPhone, isNotEmpty, minLength, passwordStrength } from '../../utils/validators'
import { PROFILE_TYPES } from '../../data/profileTypes'

const TYPE_ICON = { personal: User, business: Building2, 'business-plus': Briefcase }

export default function Register() {
  usePageMeta('Register | DayTrip', 'Create your free DayTrip account — Personal, Business, or Business+.')
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState(location.state?.accountType ? 2 : 1)
  const [accountType, setAccountType] = useState(location.state?.accountType || 'personal')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const isBusiness = accountType !== 'personal'
  const strength = passwordStrength(form.password)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validateStep2() {
    const next = {}
    if (!isNotEmpty(form.firstName)) next.firstName = 'First name is required'
    if (!isNotEmpty(form.lastName)) next.lastName = 'Last name is required'
    if (!isValidEmail(form.email)) next.email = 'Please enter a valid email address'
    if (!isValidPhone(form.phone)) next.phone = 'Please enter a valid phone number'
    if (!minLength(form.password, 8)) next.password = 'Use at least 8 characters'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match'
    if (isBusiness && !isNotEmpty(form.businessName)) next.businessName = 'Business name is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!validateStep2()) return
    setLoading(true)
    try {
      await register({ ...form, accountType })
      toast.success('Account created — welcome to DayTrip!')
      navigate('/app/home', location.state?.rebook ? { state: { rebook: location.state.rebook } } : undefined)
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-extrabold text-ink">Create your account</h1>
        <p className="mt-1.5 text-sm text-ink-soft">Choose the account type that fits you best.</p>

        <div className="mt-6 space-y-3">
          {PROFILE_TYPES.map((plan) => {
            const Icon = TYPE_ICON[plan.id]
            const selected = accountType === plan.id
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setAccountType(plan.id)}
                className={clsx(
                  'flex w-full items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-colors cursor-pointer',
                  selected ? 'border-primary bg-primary-lighter/50' : 'border-border hover:border-ink/20'
                )}
              >
                <span
                  className={clsx(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                    selected ? 'bg-primary text-ink' : 'bg-surface-muted text-ink-soft'
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center justify-between">
                    <span className="font-bold text-ink">{plan.label}</span>
                    {selected && <Check className="size-5 text-ink" />}
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold text-ink-soft">{plan.subLabel}</span>
                </span>
              </button>
            )
          })}
        </div>

        <Button fullWidth size="lg" className="mt-6" onClick={() => setStep(2)}>
          Continue
        </Button>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink hover:underline">
            Log in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => setStep(1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink cursor-pointer"
      >
        <ChevronLeft className="size-4" /> Change account type
      </button>
      <h1 className="text-2xl font-extrabold text-ink">Your details</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Setting up a <strong className="text-ink">{PROFILE_TYPES.find((p) => p.id === accountType)?.label}</strong> account.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} error={errors.firstName} autoComplete="given-name" />
          <Input label="Last name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} error={errors.lastName} autoComplete="family-name" />
        </div>
        {isBusiness && (
          <Input
            label="Business name"
            icon={<Building2 className="size-4.5" />}
            value={form.businessName}
            onChange={(e) => update('businessName', e.target.value)}
            error={errors.businessName}
          />
        )}
        <Input
          label="Email address"
          type="email"
          icon={<Mail className="size-4.5" />}
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <PhoneField
          label="Phone number"
          value={form.phone}
          onChange={(v) => update('phone', v)}
          error={errors.phone}
        />
        <div>
          <Input
            label="Password"
            type="password"
            icon={<Lock className="size-4.5" />}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={clsx(
                      'h-full flex-1 rounded-full transition-colors',
                      i < strength.score
                        ? strength.score <= 1
                          ? 'bg-danger'
                          : strength.score <= 2
                            ? 'bg-tertiary'
                            : 'bg-success'
                        : 'bg-border'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-ink-soft">{strength.label}</span>
            </div>
          )}
        </div>
        <Input
          label="Confirm password"
          type="password"
          icon={<Lock className="size-4.5" />}
          value={form.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        {formError && (
          <p className="rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger animate-slide-down">
            {formError}
          </p>
        )}

        <p className="text-xs leading-relaxed text-ink-soft">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="font-semibold text-ink hover:underline">Terms &amp; Conditions</Link> and{' '}
          <Link to="/privacy" className="font-semibold text-ink hover:underline">Privacy Policy</Link>.
        </p>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Create account
        </Button>
      </form>
    </div>
  )
}
