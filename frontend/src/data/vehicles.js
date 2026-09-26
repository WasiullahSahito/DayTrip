// Mock vehicle/fare catalogue, matching the real product's vehicle-type picker
// (Saloon / 6 / 7 / 8 seater / Wheelchair — no price or ETA shown in that picker).
// In production this would come from GET /api/vehicles/available and GET /api/bookings/quote.

// The default, unset selection shown on the booking form before a specific
// type is chosen. Not itself a choice inside the vehicle-type picker.
export const ANY_TAXI = {
  id: 'any',
  name: 'Any Taxi',
  tagline: "Quickest option — we'll get the next available taxi to you",
  passengers: 4,
  icon: 'car',
  baseFare: 3.6,
  perKm: 1.15,
  perMin: 0.32,
  minFare: 6.5,
  etaMins: 3,
}

export const VEHICLE_TYPES = [
  {
    id: 'saloon',
    name: 'Saloon',
    passengers: 4,
    icon: 'car',
    baseFare: 3.6,
    perKm: 1.15,
    perMin: 0.32,
    minFare: 6.5,
    etaMins: 4,
  },
  {
    id: 'six-seater',
    name: 'Regular 6 Seater',
    passengers: 6,
    icon: 'users',
    baseFare: 4.8,
    perKm: 1.55,
    perMin: 0.4,
    minFare: 9.5,
    etaMins: 6,
  },
  {
    id: 'seven-seater',
    name: 'Regular 7 Seater',
    passengers: 7,
    icon: 'users',
    baseFare: 5.2,
    perKm: 1.65,
    perMin: 0.42,
    minFare: 10.5,
    etaMins: 7,
  },
  {
    id: 'eight-seater',
    name: 'Regular 8 Seater',
    passengers: 8,
    icon: 'users',
    baseFare: 5.6,
    perKm: 1.75,
    perMin: 0.44,
    minFare: 11.5,
    etaMins: 8,
  },
  {
    id: 'wheelchair',
    name: 'Wheelchair',
    passengers: 4,
    icon: 'accessibility',
    caption: 'May take longer to find',
    baseFare: 3.6,
    perKm: 1.15,
    perMin: 0.32,
    minFare: 6.5,
    etaMins: 12,
  },
]

export function findVehicle(id) {
  if (id === ANY_TAXI.id) return ANY_TAXI
  return VEHICLE_TYPES.find((v) => v.id === id)
}

export function haversineKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return R * 2 * Math.asin(Math.sqrt(h))
}

// Fare = baseFare + perKm x km + perPassenger x passengers + waiting charge,
// waiting billed per minute and capped at one hour. These are only the fallback defaults
// (matching config/fare.php) — live rates come from useFareSettings().
export const FARE = {
  baseFare: 7.4,
  perKm: 2.2,
  perPassenger: 1,
  waitingPerMinute: 1,
  maxWaitingMinutes: 60,
}

export function estimateFare(distanceKm, passengers = 1, waitingMinutes = 0, rates = FARE) {
  const waiting = Math.min(Math.max(waitingMinutes, 0), rates.maxWaitingMinutes)
  const fare =
    rates.baseFare +
    distanceKm * rates.perKm +
    Math.max(passengers, 1) * rates.perPassenger +
    rates.waitingPerMinute * waiting
  return Math.round(fare * 100) / 100
}

// Returns a message if the party doesn't fit the vehicle (naming the smallest
// vehicle that would), or null if it fits.
export function capacityError(vehicle, passengers) {
  if (!vehicle || passengers <= vehicle.passengers) return null
  const bigger = VEHICLE_TYPES.filter((v) => v.passengers >= passengers).sort(
    (a, b) => a.passengers - b.passengers
  )[0]
  return bigger
    ? `${vehicle.name} seats ${vehicle.passengers}, but you entered ${passengers} passengers. Please select a ${bigger.name} (${bigger.passengers} seater) vehicle to book.`
    : `${vehicle.name} seats ${vehicle.passengers}, but you entered ${passengers} passengers. We have no vehicle that seats that many.`
}
