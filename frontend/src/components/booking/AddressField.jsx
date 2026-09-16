import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Circle, Star, Clock, LocateFixed, X, Loader2, SearchX } from 'lucide-react'
import clsx from 'clsx'
import { useDebounce } from '../../hooks/useDebounce'
import * as locationService from '../../services/locationService'

export default function AddressField({ label, placeholder, value, onChange, tone = 'pickup', autoFocus, plain = false }) {
  const [query, setQuery] = useState(value?.label || '')
  const [syncedValue, setSyncedValue] = useState(value)
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const [favourites, setFavourites] = useState([])
  const [recents, setRecents] = useState([])
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [resolvingId, setResolvingId] = useState(null)
  const debouncedQuery = useDebounce(query, 300)
  const containerRef = useRef(null)
  const internalChangeRef = useRef(false)

  // Keep the input text in sync when the parent resets/changes `value` externally
  // (e.g. rebook prefill) — but not when this component itself just caused the
  // change (typing, selecting, clearing already update `query` directly, and
  // re-deriving it here from the now-stale `value` would wipe what was just typed).
  // Standard "skip the next sync" ref flag, read/reset within the same render pass it's set in
  // (never across a commit boundary). The strict rule below bans all ref reads during render, but
  // this one carries no stale-read risk in practice.
  /* eslint-disable react-hooks/refs */
  if (value !== syncedValue) {
    setSyncedValue(value)
    if (!internalChangeRef.current) {
      setQuery(value?.label || '')
    }
    internalChangeRef.current = false
  }
  /* eslint-enable react-hooks/refs */

  useEffect(() => {
    function onClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    if (!open) return
    locationService.getFavourites().then(setFavourites)
    locationService.getRecents().then(setRecents)
  }, [open])

  useEffect(() => {
    if (!open || !debouncedQuery || debouncedQuery === value?.label) {
      return
    }
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-change pattern: flip the loading flag before the async call starts
    setSearching(true)
    locationService.search(debouncedQuery).then((r) => {
      if (!cancelled) {
        setResults(r)
        setSearching(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [debouncedQuery, open, value])

  async function select(address) {
    setQuery(address.label)
    setResolvingId(address.id)
    try {
      const resolved = await locationService.resolveAddress(address)
      internalChangeRef.current = true
      onChange(resolved)
      locationService.pushRecent(resolved)
      setOpen(false)
    } catch {
      // Resolution failed (bad/expired place ID, network issue) — revert
      // instead of committing an address with no coordinates.
      setQuery(value?.label || '')
    } finally {
      setResolvingId(null)
    }
  }

  function clear() {
    internalChangeRef.current = true
    onChange(null)
    setQuery('')
    setOpen(true)
  }

  async function useCurrentLocation() {
    setLocating(true)
    const address = await locationService.reverseGeocode()
    setLocating(false)
    select(address)
  }

  const showQuery = query.trim().length >= 2

  return (
    <div className="relative" ref={containerRef}>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <div className="relative flex items-center">
        {!plain && (
          <span
            className={clsx(
              'pointer-events-none absolute left-3.5',
              tone === 'pickup' ? 'text-ink' : tone === 'destination' ? 'text-primary-dark' : 'text-ink-soft'
            )}
          >
            {tone === 'pickup' ? (
              <MapPin className="size-4.5" />
            ) : tone === 'destination' ? (
              <Navigation className="size-4.5" />
            ) : (
              <Circle className="size-3.5" />
            )}
          </span>
        )}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (value) {
              internalChangeRef.current = true
              onChange(null)
            }
          }}
          onFocus={() => setOpen(true)}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={clsx(
            'w-full text-[15px] font-medium text-ink placeholder:text-ink-soft/60 placeholder:font-normal focus:outline-none',
            plain
              ? 'h-9 bg-transparent pr-6'
              : 'h-12 rounded-xl border border-border bg-white pl-10 pr-9 focus:border-primary focus:ring-2 focus:ring-primary/50'
          )}
        />
        {query && (
          <button
            onClick={clear}
            className={clsx('absolute text-ink-soft hover:text-ink cursor-pointer', plain ? 'right-0' : 'right-3.5')}
            aria-label="Clear"
            type="button"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-pop)] animate-slide-down">
          <button
            type="button"
            onClick={useCurrentLocation}
            className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left hover:bg-surface-muted cursor-pointer"
          >
            {locating ? (
              <Loader2 className="size-4.5 animate-spin text-ink-soft" />
            ) : (
              <LocateFixed className="size-4.5 text-info" />
            )}
            <span className="text-sm font-semibold text-ink">Use my current location</span>
          </button>

          <div className={clsx('max-h-72 overflow-y-auto py-1', resolvingId && 'pointer-events-none opacity-60')}>
            {resolvingId && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-ink-soft">
                <Loader2 className="size-4 animate-spin" /> Confirming address…
              </div>
            )}

            {!resolvingId && searching && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-ink-soft">
                <Loader2 className="size-4 animate-spin" /> Searching for addresses…
              </div>
            )}

            {!searching && showQuery && results.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <SearchX className="size-6 text-ink-soft/60" />
                <p className="text-sm font-medium text-ink-soft">No results found, please try a different address</p>
              </div>
            )}

            {!searching &&
              !showQuery &&
              favourites.length > 0 &&
              favourites.map((a) => (
                <ResultRow key={a.id} icon={<Star className="size-4 text-tertiary" />} address={a} sub={a.nickname} onClick={() => select(a)} />
              ))}

            {!searching &&
              !showQuery &&
              recents.length > 0 &&
              recents.map((a) => (
                <ResultRow key={`recent-${a.id}`} icon={<Clock className="size-4 text-ink-soft" />} address={a} onClick={() => select(a)} />
              ))}

            {!searching &&
              showQuery &&
              results.map((a) => (
                <ResultRow key={a.id} icon={<MapPin className="size-4 text-ink-soft" />} address={a} onClick={() => select(a)} />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ResultRow({ icon, address, sub, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-surface-muted cursor-pointer"
    >
      <span className="mt-0.5">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{address.label}</span>
        <span className="block truncate text-xs text-ink-soft">{sub || address.secondary}</span>
      </span>
    </button>
  )
}
