import { api } from './api'
import { uid } from './storage'

// Simulated status timeline (seconds elapsed since creation), purely a
// cosmetic "live tracking" animation layered on top of the real, backend-
// authoritative status. The backend never reports fine-grained dispatch
// states — there's no real driver fleet behind this demo — but `cancelled`,
// `pending_payment`, and `confirmed` below always come from the server.
const TIMELINE = {
  searching: 0,
  driver_assigned: 5,
  driver_en_route: 8,
  driver_arrived: 22,
  in_progress: 30,
}

export async function getQuotesForRoute({ pickup, destination, vehicleTypeId }) {
  return api.post('/fare-quote', {
    pickup: { lat: pickup.lat, lng: pickup.lng },
    destination: { lat: destination.lat, lng: destination.lng },
    ...(vehicleTypeId ? { vehicleTypeId } : {}),
  })
}

export async function createBooking(details) {
  return api.post(
    '/bookings',
    {
      pickup: toPoint(details.pickup),
      destination: toPoint(details.destination),
      stops: (details.stops || []).filter(Boolean).map(toPoint),
      // "Any Taxi" is a frontend-only default meaning "dispatcher's choice"
      // — there's no such vehicle type server-side, so it's resolved to the
      // Saloon rate (the same one it's quoted at) at the point of booking.
      vehicleTypeId: details.vehicle.id === 'any' ? 'saloon' : details.vehicle.id,
      scheduledFor: details.scheduledFor || undefined,
      passengerName: details.passengerName,
      phone: details.phone,
      notes: details.notes || undefined,
      flightNumber: details.flightNumber || undefined,
      confirmationEmail: details.confirmationEmail || undefined,
      returnJourney: details.returnJourney || undefined,
      paymentMethod: details.paymentMethod,
    },
    { idempotencyKey: details.idempotencyKey || uid('idem') }
  )
}

function toPoint(address) {
  return { label: address.label, secondary: address.secondary, lat: address.lat, lng: address.lng }
}

export function computeLiveStatus(booking) {
  if (booking.status === 'cancelled' || booking.cancelled) return { status: 'cancelled', etaMins: null }
  if (booking.status === 'pending_payment') return { status: 'pending_payment', etaMins: null }

  if (booking.isScheduled) {
    const msToPickup = booking.scheduledFor - Date.now()
    if (msToPickup > 5 * 60 * 1000) {
      return { status: 'scheduled', etaMins: Math.round(msToPickup / 60000) }
    }
  }

  const elapsedSec = (Date.now() - booking.createdAt) / 1000
  if (elapsedSec < TIMELINE.driver_assigned) {
    return { status: 'searching', etaMins: null }
  }
  if (elapsedSec < TIMELINE.driver_en_route) {
    return { status: 'driver_assigned', etaMins: booking.vehicle?.etaMins ?? 5 }
  }
  if (elapsedSec < TIMELINE.driver_arrived) {
    const remaining = Math.max(1, Math.round(TIMELINE.driver_arrived - elapsedSec))
    return { status: 'driver_en_route', etaMins: remaining }
  }
  if (elapsedSec < TIMELINE.in_progress) {
    return { status: 'driver_arrived', etaMins: 0 }
  }
  const tripElapsed = elapsedSec - TIMELINE.in_progress
  if (tripElapsed < booking.tripDurationSec) {
    const remainingMin = Math.max(1, Math.round((booking.tripDurationSec - tripElapsed) / 60))
    return { status: 'in_progress', etaMins: remainingMin }
  }
  return { status: 'completed', etaMins: 0 }
}

export async function getActiveBookings() {
  const page = await api.get('/bookings?status=active&per_page=50')
  return page.data
}

export async function getHistory() {
  const page = await api.get('/bookings?status=history&per_page=50')
  return page.data
}

export async function getBooking(id) {
  try {
    return await api.get(`/bookings/${id}`)
  } catch (err) {
    if (err.status === 404 || err.status === 403) return null
    throw err
  }
}

export async function cancelBooking(id) {
  return api.post(`/bookings/${id}/cancel`)
}

export async function messageDriver(id, message) {
  // No real driver messaging backend exists behind this demo's mock driver —
  // kept as a local no-op so the UI's "Message driver" flow still works.
  await new Promise((resolve) => setTimeout(resolve, 400))
  return { id: uid('msg'), bookingId: id, message, sentAt: Date.now() }
}

// Quick bookings — saved templates for one-tap rebooking.
export async function getQuickBookings() {
  return api.get('/quick-bookings')
}

export async function addQuickBooking(template) {
  return api.post('/quick-bookings', {
    label: template.label,
    vehicleTypeId: template.vehicle.id,
    pickup: toPoint(template.pickup),
    destination: toPoint(template.destination),
  })
}

export async function removeQuickBooking(id) {
  return api.delete(`/quick-bookings/${id}`)
}
