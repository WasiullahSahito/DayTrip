import { useEffect, useState } from 'react'
import { FARE } from '../data/vehicles'
import * as fareService from '../services/fareService'

let cached = null
let inflight = null

// Live fare rates from the API (admin-editable). Starts from the built-in
// defaults so previews render immediately, then swaps in the real rates.
export function useFareSettings() {
  const [fare, setFare] = useState(cached || FARE)

  useEffect(() => {
    if (cached) return
    inflight ??= fareService.getFareSettings().then((s) => (cached = s))
    let cancelled = false
    inflight
      .then((s) => {
        if (!cancelled) setFare(s)
      })
      .catch(() => {
        inflight = null
      })
    return () => {
      cancelled = true
    }
  }, [])

  return fare
}
