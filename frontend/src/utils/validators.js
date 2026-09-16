export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export function isValidPhone(value) {
  return /^[+]?[\d\s()-]{7,20}$/.test(String(value || '').trim())
}

export function isNotEmpty(value) {
  return String(value ?? '').trim().length > 0
}

export function minLength(value, len) {
  return String(value ?? '').trim().length >= len
}

export function passwordStrength(value) {
  const v = String(value || '')
  if (v.length === 0) return { score: 0, label: '' }
  let score = 0
  if (v.length >= 8) score++
  if (/[A-Z]/.test(v)) score++
  if (/[0-9]/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v)) score++
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[score] }
}
