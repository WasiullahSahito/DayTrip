import { useEffect, useState } from 'react'
import { VEHICLE_TYPES } from '../data/vehicles'
import * as vehicleTypeService from '../services/vehicleTypeService'

let cached = null
let inflight = null

// Live, admin-managed vehicle types (GET /api/vehicle-types) — what's active,
// their names, seat counts, icons — same fetch-once-and-cache pattern as
// useFareSettings. Starts from the built-in defaults so pickers render
// immediately, then swaps in the real list once it arrives.
export function useVehicleTypes() {
  const [vehicles, setVehicles] = useState(cached || VEHICLE_TYPES)

  useEffect(() => {
    if (cached) return
    inflight ??= vehicleTypeService.getVehicleTypes().then((v) => (cached = v))
    let cancelled = false
    inflight
      .then((v) => {
        if (!cancelled) setVehicles(v)
      })
      .catch(() => {
        inflight = null
      })
    return () => {
      cancelled = true
    }
  }, [])

  return vehicles
}
