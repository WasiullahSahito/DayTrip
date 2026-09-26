import { api } from './api'

export async function getFareSettings() {
  return api.get('/fare-settings')
}
