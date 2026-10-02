import { api, getToken, setToken } from './api'

export async function login({ email, password }) {
  const data = await api.post('/auth/login', { email, password })
  setToken(data.token)
  return data.user
}

export async function register(payload) {
  const body = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    accountType: payload.accountType,
    businessName: payload.businessName || null,
  }
  // Password is optional at signup — only send it (and its confirmation)
  // when the user actually set one, so the backend's "nullable" validation
  // leaves the account passwordless rather than rejecting an empty string.
  if (payload.password) {
    body.password = payload.password
    body.password_confirmation = payload.confirmPassword
  }
  const data = await api.post('/auth/register', body)
  setToken(data.token)
  return data.user
}

export async function guestCheckout({ firstName, lastName, email, phone }) {
  const data = await api.post('/auth/guest', { firstName, lastName, email, phone })
  setToken(data.token)
  return data.user
}

export async function logout() {
  try {
    await api.post('/auth/logout')
  } finally {
    setToken(null)
  }
}

export async function requestPasswordReset(email) {
  await api.post('/auth/forgot-password', { email })
  // The backend deliberately never reveals whether the email exists.
  return { sent: true }
}

export async function resetPassword({ token, email, password }) {
  await api.post('/auth/reset-password', {
    token,
    email,
    password,
    password_confirmation: password,
  })
}

export async function getCurrentUser() {
  if (!getToken()) return null
  try {
    return await api.get('/auth/user')
  } catch {
    return null
  }
}

export async function updateProfile(userId, updates) {
  // The backend always updates the authenticated user — userId is accepted
  // here only to keep this function's signature stable for callers.
  return api.patch('/auth/profile', updates)
}
