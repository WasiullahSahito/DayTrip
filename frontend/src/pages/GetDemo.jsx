import { useState } from 'react'
import { Building2, Mail, User, Users, ArrowRight } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import PhoneField from '../components/ui/PhoneField'
import Button from '../components/ui/Button'
import { useToast } from '../context/ToastContext'
import { isValidEmail, isValidPhone, isNotEmpty } from '../utils/validators'
import { delay } from '../services/storage'

const BUSINESS_TYPES = ['Corporate', 'Healthcare', 'Hospitality', 'Public Sector', 'Other']

export default function GetDemo() {
  usePageMeta('Get a Demo | DayTrip Business', 'Request a demo of DayTrip Business — tell us about your organisation and we’ll be in touch.')

  const toast = useToast()
  const [form, setForm] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    businessType: BUSINESS_TYPES[0],
    users: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!isNotEmpty(form.companyName)) next.companyName = 'Company name is required'
    if (!isNotEmpty(form.name)) next.name = 'Your name is required'
    if (!isValidEmail(form.email)) next.email = 'Please enter a valid email address'
    if (!isValidPhone(form.phone)) next.phone = 'Please enter a valid phone number'
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    await delay(900)
    setLoading(false)
    setSubmitted(true)
    toast.success('Demo request sent — we’ll be in touch shortly.')
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-extrabold text-ink">Thanks, {form.name.split(' ')[0]}!</h1>
        <p className="mt-2 text-ink-soft">
          A member of the DayTrip Business team will reach out to {form.email} within one working day.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Request a demo</h1>
        <p className="mt-3 text-ink-soft">Tell us about your organisation and we'll show you how DayTrip Business fits.</p>
      </div>

      <Card className="mt-10 !p-7">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label="Company name" icon={<Building2 className="size-4.5" />} value={form.companyName} onChange={(e) => update('companyName', e.target.value)} error={errors.companyName} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Your name" icon={<User className="size-4.5" />} value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} />
            <Input label="Email address" type="email" icon={<Mail className="size-4.5" />} value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PhoneField label="Phone number" value={form.phone} onChange={(v) => update('phone', v)} error={errors.phone} />
            <Input label="Number of users" icon={<Users className="size-4.5" />} placeholder="e.g. 25" value={form.users} onChange={(e) => update('users', e.target.value)} />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Business type</span>
            <select
              value={form.businessType}
              onChange={(e) => update('businessType', e.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-white px-3.5 text-[15px] text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Message (optional)</span>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Tell us a bit about what you're looking for"
              className="w-full resize-none rounded-xl border border-border bg-white p-3.5 text-[15px] text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </label>
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Request demo <ArrowRight className="size-4.5" />
          </Button>
        </form>
      </Card>
    </div>
  )
}
