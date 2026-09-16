import { api, getToken, setToken } from './api'

export async function login({ email, password }) {
  const data = await api.post('/auth/login', { email, password })
  setToken(data.token)
  return data.user
}

export async function register(payload) {
  const data = await api.post('/auth/register', {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    password: payload.password,
    password_confirmation: payload.confirmPassword,
    phone: payload.phone,
    accountType: payload.accountType,
    businessName: payload.businessName || null,
  })
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
