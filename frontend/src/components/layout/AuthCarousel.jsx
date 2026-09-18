import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Building2, Hotel, Clock } from 'lucide-react'

// Mirrors the real login screen's marketing carousel content
// (sourced from /api/content/login-images: "Corporate Business Travel",
// "Hospitality Guest Bookings", "Save Time").
const SLIDES = [
  {
    icon: Building2,
    title: 'Corporate business travel',
    body: 'Give your team a reliable way to get where they need to be, with centralised billing and reporting.',
  },
  {
    icon: Hotel,
    title: 'Hospitality guest bookings',
    body: 'Arrange seamless taxi transfers for your guests, day or night, without lifting a phone.',
  },
  {
    icon: Clock,
    title: 'Save time',
    body: 'Favourite addresses, quick bookings and one-tap rebooking get you moving faster.',
  },
]

export default function AuthCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 4500)
    return () => clearInterval(t)
  }, [])

  const Slide = SLIDES[active]

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-ink p-10 text-white">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 70%, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-primary">
          Trusted across Galway
        </span>
      </div>

      <div key={active} className="relative animate-slide-up">
        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-ink">
          <Slide.icon className="size-7" />
        </div>
        <h3 className="text-2xl font-bold leading-snug">{Slide.title}</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">{Slide.body}</p>
      </div>

      <div className="relative flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Slide ${i + 1}`}
            className={clsx(
              'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
              i === active ? 'w-8 bg-primary' : 'w-1.5 bg-white/25'
            )}
          />
        ))}
      </div>
    </div>
  )
}
