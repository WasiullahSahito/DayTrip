import { api } from './api'

export async function getStats() {
  return api.get('/admin/stats')
}

export async function getDrivers(query = '') {
  return api.get(`/admin/drivers${query}`)
}

export async function createDriver(payload) {
  return api.post('/admin/drivers', payload)
}

export async function updateDriver(id, payload) {
  return api.patch(`/admin/drivers/${id}`, payload)
}

export async function deleteDriver(id) {
  return api.delete(`/admin/drivers/${id}`)
}

export async function getVehicleTypes() {
  return api.get('/admin/vehicle-types')
}

export async function createVehicleType(payload) {
  return api.post('/admin/vehicle-types', payload)
}

export async function updateVehicleType(id, payload) {
  return api.patch(`/admin/vehicle-types/${id}`, payload)
}

export async function getFareSettings() {
  return api.get('/admin/fare-settings')
}

export async function updateFareSettings(payload) {
  return api.patch('/admin/fare-settings', payload)
}

export async function getBookings(query = '') {
  return api.get(`/admin/bookings${query}`)
}

export async function updateBookingStatus(id, status) {
  return api.patch(`/admin/bookings/${id}/status`, { status })
}

export async function assignDriver(bookingId, driverId) {
  return api.post(`/admin/bookings/${bookingId}/assign-driver`, { driverId })
}
