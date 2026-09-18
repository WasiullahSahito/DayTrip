import { searchAddresses } from '../data/addresses'
import { readStore, writeStore, delay } from './storage'
import { api } from './api'
import * as googleMaps from './googleMaps'

const RECENTS_KEY = 'recents'

async function mockReverseGeocode() {
  await delay(500)
  // Mock "use my current location" — resolves to a plausible Galway city-centre point.
  return {
    id: 'current',
    label: 'Your current location',
    secondary: 'Galway City Centre',
    lat: 53.3498,
    lng: -6.2603,
  }
}

export async function search(query) {
  if (!query || query.trim().length < 2) return []
  if (googleMaps.isGoogleMapsConfigured()) {
    try {
      return await googleMaps.searchPlaces(query)
    } catch {
      // Fall through to the mock address book so the field stays usable
      // if the Maps request fails (network issue, bad/quota-exceeded key).
    }
  }
  await delay(350)
  return searchAddresses(query)
}

// Predictions from `search()` carry a Google place ID but no coordinates yet
// (Autocomplete doesn't return geometry) — this resolves them to a full
// address with lat/lng right before the caller commits to the selection.
// Mock results already carry lat/lng, so they pass straight through.
export async function resolveAddress(address) {
  if (!address || (address.lat != null && address.lng != null)) return address
  if (googleMaps.isGoogleMapsConfigured()) {
    return googleMaps.resolvePlace(address.id)
  }
  return address
}

export async function reverseGeocode() {
  if (googleMaps.isGoogleMapsConfigured()) {
    try {
      const { lat, lng } = await googleMaps.getBrowserPosition()
      return await googleMaps.reverseGeocodePoint(lat, lng)
    } catch {
      // Falls back to the mock location below if geolocation is denied/
      // unavailable or the geocoding request fails.
    }
  }
  return mockReverseGeocode()
}

export async function getFavourites() {
  return api.get('/favourites')
}

export async function addFavourite(address, nickname) {
  await api.post('/favourites', {
    nickname,
    label: address.label,
    secondary: address.secondary,
    lat: address.lat,
    lng: address.lng,
  })
  // The create endpoint returns just the new favourite — re-fetch the full
  // list so callers keep getting "the whole list" as they did before.
  return getFavourites()
}

export async function removeFavourite(id) {
  return api.delete(`/favourites/${id}`)
}

export async function getRecents() {
  await delay(250)
  return readStore(RECENTS_KEY, [])
}

export async function pushRecent(address) {
  const recents = readStore(RECENTS_KEY, [])
  const deduped = [address, ...recents.filter((r) => r.id !== address.id)].slice(0, 8)
  writeStore(RECENTS_KEY, deduped)
  return deduped
}
