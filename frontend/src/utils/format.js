export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date, opts = {}) {
  const d = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('en-IE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...opts,
  }).format(d)
}

export function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
}

export function formatDateTime(date) {
  return `${formatDate(date)}, ${formatTime(date)}`
}

export function relativeMinutes(mins) {
  if (mins <= 0) return 'Arriving now'
  if (mins === 1) return '1 min'
  return `${mins} mins`
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('')
}
