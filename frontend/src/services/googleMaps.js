import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

// Anything prefixed VITE_ is bundled into the client build and publicly
// visible — this must be a Maps JavaScript API key restricted (in the
// Google Cloud Console) to this app's origin(s), never a server-side key.
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

let librariesPromise = null
let optionsSet = false
let sessionToken = null

export function isGoogleMapsConfigured() {
  return Boolean(API_KEY)
}

// A misconfigured/invalid key doesn't always reject cleanly — Google's SDK
// can just leave the request hanging — so every network-facing call here is
// bounded, and search()/reverseGeocode() in locationService.js catch the
// resulting rejection to fall back to the mock address book.
function withTimeout(promise, ms, message) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))])
}

function loadLibraries() {
  if (!librariesPromise) {
    if (!optionsSet) {
      setOptions({ key: API_KEY, v: 'weekly' })
      optionsSet = true
    }
    librariesPromise = withTimeout(
      Promise.all([importLibrary('places'), importLibrary('geocoding')]),
      8000,
      'Google Maps failed to load'
    ).catch((err) => {
      librariesPromise = null
      throw err
    })
  }
  return librariesPromise
}

// Reused across keystrokes for one search, then discarded once a place is
// picked — avoids minting a new Autocomplete session for every character typed.
function currentSessionToken(placesLib) {
  if (!sessionToken) sessionToken = new placesLib.AutocompleteSessionToken()
  return sessionToken
}

function toPoint(label, secondary, id, location) {
  return {
    id,
    label,
    secondary,
    lat: location.lat(),
    lng: location.lng(),
  }
}

function splitFormattedAddress(formatted) {
  const [first, ...rest] = formatted.split(',')
  return { label: first.trim(), secondary: rest.join(',').trim() }
}

export async function searchPlaces(query) {
  if (!isGoogleMapsConfigured()) return []
  const [placesLib] = await loadLibraries()
  // AutocompleteSuggestion is the current Places API — the older
  // AutocompleteService is closed to new Cloud projects as of March 2025,
  // so this is the only predictions API a freshly-provisioned key can use.
  const { suggestions } = await withTimeout(
    placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: query,
      sessionToken: currentSessionToken(placesLib),
      includedRegionCodes: ['ie'],
    }),
    6000,
    'Address search timed out'
  )
  return (suggestions || [])
    .filter((s) => s.placePrediction)
    .map((s) => ({
      id: s.placePrediction.placeId,
      label: String(s.placePrediction.mainText || s.placePrediction.text),
      secondary: s.placePrediction.secondaryText ? String(s.placePrediction.secondaryText) : '',
    }))
}

export async function resolvePlace(placeId) {
  if (!isGoogleMapsConfigured()) throw new Error('Google Maps is not configured')
  const [placesLib] = await loadLibraries()
  const place = new placesLib.Place({ id: placeId })
  await withTimeout(
    place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] }),
    6000,
    'Could not resolve that address in time'
  )
  // A selection was made — the next search starts a fresh session token.
  sessionToken = null
  if (!place.location) throw new Error('Could not resolve that address')
  const formatted = place.formattedAddress || ''
  const { label: fallbackLabel, secondary: fallbackSecondary } = splitFormattedAddress(formatted)
  const label = place.displayName || fallbackLabel
  const secondary = place.displayName ? formatted : fallbackSecondary
  return toPoint(label, secondary, placeId, place.location)
}

export async function reverseGeocodePoint(lat, lng) {
  if (!isGoogleMapsConfigured()) throw new Error('Google Maps is not configured')
  const [, { Geocoder }] = await loadLibraries()
  const geocoder = new Geocoder()
  const { results } = await withTimeout(
    geocoder.geocode({ location: { lat, lng } }),
    6000,
    'Could not resolve your location in time'
  )
  const result = results?.[0]
  if (!result) throw new Error('Could not resolve your location')
  const { label, secondary } = splitFormattedAddress(result.formatted_address)
  return toPoint(label, secondary, result.place_id, result.geometry.location)
}

export function getBrowserPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  })
}
