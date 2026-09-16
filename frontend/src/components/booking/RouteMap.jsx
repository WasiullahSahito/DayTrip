import { MapPin, Navigation, Car } from 'lucide-react'
import clsx from 'clsx'

// Fixed pseudo-random positions/rotations for the ambient "taxis nearby" markers
// shown while no route is set — echoes the roaming-taxi map on the real product's
// booking screen. Static + staggered opacity pulses rather than real movement,
// which reads as "live" without needing a movement engine.
const AMBIENT_TAXIS = [
  { x: 12, y: 18, rotate: -20, delay: 0 },
  { x: 28, y: 42, rotate: 15, delay: 0.3 },
  { x: 8, y: 68, rotate: 35, delay: 0.6 },
  { x: 45, y: 12, rotate: -8, delay: 0.9 },
  { x: 62, y: 30, rotate: 25, delay: 0.2 },
  { x: 80, y: 15, rotate: -30, delay: 0.5 },
  { x: 88, y: 55, rotate: 10, delay: 0.8 },
  { x: 70, y: 75, rotate: -15, delay: 1.1 },
  { x: 38, y: 82, rotate: 20, delay: 0.4 },
  { x: 20, y: 90, rotate: -25, delay: 0.7 },
]

// A stylised, self-contained "map" — no external map SDK/API key required.
// Structured so a real provider (MapLibre/Google Maps) can be swapped in later
// behind the same props by reading VITE_MAP_API_KEY.
export default function RouteMap({ pickup, destination, stops = [], driverProgress = null, className }) {
  const hasRoute = pickup && destination

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl border border-border bg-[#eef1f0]',
        className
      )}
    >
      <svg viewBox="0 0 400 260" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d8dedb" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="260" fill="url(#grid)" />
        <path d="M0 60 Q100 20 200 55 T400 40" stroke="#d5dbd8" strokeWidth="10" fill="none" />
        <path d="M0 190 Q120 230 220 190 T400 210" stroke="#d5dbd8" strokeWidth="14" fill="none" />
        <path d="M60 0 Q40 120 70 260" stroke="#dfe4e1" strokeWidth="8" fill="none" />
        <path d="M330 0 Q360 130 320 260" stroke="#dfe4e1" strokeWidth="8" fill="none" />

        {hasRoute && (
          <path
            d="M70 190 C 140 190, 150 100, 220 90 S 320 60, 330 55"
            stroke="#111F29"
            strokeWidth="3"
            strokeDasharray="1 10"
            strokeLinecap="round"
            fill="none"
            className="animate-fade-in"
          />
        )}

        {hasRoute && (
          <>
            <circle cx="70" cy="190" r="6" fill="#111F29" />
            <circle cx="330" cy="55" r="6" fill="#FFCC00" stroke="#111F29" strokeWidth="1.5" />
            {stops.map((_, i) => (
              <circle
                key={i}
                cx={120 + i * 40}
                cy={150 - i * 15}
                r="4.5"
                fill="#fff"
                stroke="#111F29"
                strokeWidth="2"
              />
            ))}
            {driverProgress != null && (
              <circle
                cx={70 + (330 - 70) * driverProgress}
                cy={190 + (55 - 190) * driverProgress}
                r="7"
                fill="#FFCC00"
                stroke="#111F29"
                strokeWidth="2"
              />
            )}
          </>
        )}
      </svg>

      {hasRoute ? (
        <>
          <MapLabel style={{ left: '17.5%', top: '73%' }} icon={<MapPin className="size-3.5 text-white" />} bg="bg-ink" label={pickup.label} align="top" />
          <MapLabel style={{ left: '82.5%', top: '21%' }} icon={<Navigation className="size-3.5 text-ink" />} bg="bg-primary" label={destination.label} align="bottom" />
          {driverProgress != null && (
            <div
              className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[var(--shadow-pop)]"
              style={{
                left: `${17.5 + (82.5 - 17.5) * driverProgress}%`,
                top: `${73 + (21 - 73) * driverProgress}%`,
              }}
            >
              <Car className="size-4 text-ink" />
            </div>
          )}
        </>
      ) : (
        <>
          {AMBIENT_TAXIS.map((t, i) => (
            <span
              key={i}
              className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-primary text-ink shadow-sm animate-pulse-soft"
              style={{ left: `${t.x}%`, top: `${t.y}%`, transform: `rotate(${t.rotate}deg)`, animationDelay: `${t.delay}s` }}
            >
              <Car className="size-3.5" style={{ transform: `rotate(${-t.rotate}deg)` }} />
            </span>
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-ink-soft shadow-sm">
              Enter a pickup &amp; destination to preview your route
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function MapLabel({ style, icon, bg, label, align }) {
  return (
    <div
      className="absolute flex -translate-x-1/2 flex-col items-center gap-1"
      style={{ ...style, transform: `translate(-50%, ${align === 'top' ? '-100%' : '0'})` }}
    >
      {align === 'bottom' && (
        <span className={clsx('flex size-7 items-center justify-center rounded-full shadow-[var(--shadow-pop)]', bg)}>{icon}</span>
      )}
      <span className="max-w-[120px] truncate rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-ink shadow-sm">
        {label}
      </span>
      {align === 'top' && (
        <span className={clsx('flex size-7 items-center justify-center rounded-full shadow-[var(--shadow-pop)]', bg)}>{icon}</span>
      )}
    </div>
  )
}
