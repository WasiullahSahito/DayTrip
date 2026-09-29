import { api } from './api'

export async function getVehicleTypes() {
  return api.get('/vehicle-types')
}
