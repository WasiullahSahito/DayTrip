import { Fragment } from 'react'
import { Plus, MapPin, X } from 'lucide-react'
import AddressField from './AddressField'

const MAX_STOPS = 3

export default function RouteFieldsPanel({ pickup, destination, stops, onPickupChange, onDestinationChange, onStopsChange }) {
  const rows = [
    { key: 'pickup', kind: 'pickup' },
    ...stops.map((_, i) => ({ key: `stop-${i}`, kind: 'stop', index: i })),
    { key: 'destination', kind: 'destination' },
  ]

  function updateStop(index, address) {
    const next = [...stops]
    next[index] = address
    onStopsChange(next)
  }

  function removeStop(index) {
    onStopsChange(stops.filter((_, i) => i !== index))
  }

  function addStop() {
    if (stops.length >= MAX_STOPS) return
    onStopsChange([...stops, null])
  }

  return (
    <div className="relative rounded-2xl border border-border bg-white p-4">
      {stops.length < MAX_STOPS && (
        <button
          type="button"
          onClick={addStop}
          aria-label="Add a stop"
          title="Add a stop"
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-ink text-white hover:bg-ink-soft cursor-pointer"
        >
          <Plus className="size-4" />
        </button>
      )}

      <div className="flex gap-3">
        <div className="flex flex-col items-center pt-4 pb-4">
          {rows.map((row, i) => (
            <Fragment key={row.key}>
              {i > 0 && <span className="w-px flex-1 bg-border" />}
              {row.kind === 'pickup' && <span className="size-3 shrink-0 rounded-full border-2 border-ink bg-primary" />}
              {row.kind === 'stop' && <span className="size-2.5 shrink-0 rounded-full border-2 border-ink-soft bg-white" />}
              {row.kind === 'destination' && <MapPin className="size-4 shrink-0 text-ink" />}
            </Fragment>
          ))}
        </div>

        <div className="flex-1 divide-y divide-border pr-10">
          <div className="pb-3">
            <AddressField placeholder="Pickup location (From)" value={pickup} onChange={onPickupChange} tone="pickup" plain />
          </div>
          {stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-2 py-3">
              <div className="flex-1">
                <AddressField placeholder={`Stop ${i + 1}`} value={stop} onChange={(a) => updateStop(i, a)} tone="stop" plain />
              </div>
              <button
                type="button"
                onClick={() => removeStop(i)}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-danger-bg hover:text-danger cursor-pointer"
                aria-label="Remove stop"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          <div className="pt-3">
            <AddressField placeholder="Destination (To)" value={destination} onChange={onDestinationChange} tone="destination" plain />
          </div>
        </div>
      </div>
    </div>
  )
}
