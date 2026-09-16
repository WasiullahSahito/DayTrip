const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const TOKEN_KEY = 'lynk-clone:token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(method, path, body, { idempotencyKey } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Unable to reach the server. Please check your connection and try again.')
  }

  let json = null
  try {
    json = await response.json()
  } catch {
    // no/invalid JSON body — fall through to status-based handling below
  }

  if (!response.ok) {
    // Prefer the first field-level validation message (e.g. login's
    // "Incorrect email or password") over the generic 422 envelope message.
    const firstFieldError = json?.errors ? Object.values(json.errors)[0]?.[0] : null;
    const message = firstFieldError || json?.message || 'Something went wrong. Please try again.'
    const error = new Error(message)
    error.status = response.status
    error.errors = json?.errors || null

    if (response.status === 401) {
      setToken(null)
    }

    throw error
  }

  return json?.data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body, options) => request('POST', path, body, options),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
}
