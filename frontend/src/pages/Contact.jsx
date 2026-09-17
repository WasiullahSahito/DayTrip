import { useState } from 'react'
import { Phone, Mail, MapPin, Send } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useToast } from '../context/ToastContext'
import { isValidEmail, isNotEmpty } from '../utils/validators'
import { delay } from '../services/storage'

const TOPICS = ['Booking Issue', 'General Query', 'Accounts and Payments']

export default function Contact() {
  usePageMeta('Contact Us | DayTrip', 'Get in touch with the DayTrip team — bookings, general queries, or accounts and payments.')
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', topic: TOPICS[0], message: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!isNotEmpty(form.name)) next.name = 'Please tell us your name'
    if (!isValidEmail(form.email)) next.email = 'Please enter a valid email address'
    if (!isNotEmpty(form.message) || form.message.trim().length < 10)
      next.message = 'Please add a little more detail (min. 10 characters)'
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    await delay(900)
    setLoading(false)
    toast.success('Thanks — we’ll be in touch shortly.')
    setForm({ name: '', email: '', topic: TOPICS[0], message: '' })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Contact us</h1>
        <p className="mt-3 text-ink-soft">
          If you have any queries please submit the form and we’ll contact you shortly.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <InfoCard icon={<Phone className="size-5" />} title="Bookings" lines={['+353 89 429 8440', '24 hours']} />
          <InfoCard icon={<Phone className="size-5" />} title="General enquiries" lines={['+353 89 429 8440', 'Mon–Fri, 9am–5pm']} />
          <InfoCard icon={<Mail className="size-5" />} title="Email" lines={['booking@daytrip.ie']} />
          <InfoCard icon={<MapPin className="size-5" />} title="Address" lines={['Unit 21, Parkmore Industrial Estate', 'Long Mile Road, Dublin']} />
        </div>

        <Card className="!p-7">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input label="Your name" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} />
            <Input label="Email address" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Topic</span>
              <select
                value={form.topic}
                onChange={(e) => update('topic', e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-white px-3.5 text-[15px] text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                {TOPICS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Message</span>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                placeholder="Minimum 5 characters, maximum 300 characters"
                maxLength={300}
                className="w-full resize-none rounded-xl border border-border bg-white p-3.5 text-[15px] text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              {errors.message ? (
                <span className="mt-1.5 block text-xs font-medium text-danger">{errors.message}</span>
              ) : (
                <span className="mt-1.5 block text-right text-xs text-ink-soft">{form.message.length}/300</span>
              )}
            </label>
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Send message <Send className="size-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

function InfoCard({ icon, title, lines }) {
  return (
    <Card className="flex items-start gap-3.5 !p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-ink">{icon}</span>
      <div>
        <p className="font-bold text-ink">{title}</p>
        {lines.map((l) => (
          <p key={l} className="text-sm text-ink-soft">{l}</p>
        ))}
      </div>
    </Card>
  )
}
