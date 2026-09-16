// Mock address book standing in for a real geocoding provider (Google/Mapbox).
// Coordinates are approximate real-world Dublin locations.
export const ADDRESS_BOOK = [
  { id: 'a1', label: 'Dublin Airport (DUB)', secondary: 'Collinstown, Co. Dublin', lat: 53.4264, lng: -6.2499 },
  { id: 'a2', label: 'Dublin Connolly Station', secondary: 'Amiens St, North Dock, Dublin 1', lat: 53.3514, lng: -6.2498 },
  { id: 'a3', label: 'Heuston Station', secondary: 'St John’s Rd W, Dublin 8', lat: 53.3467, lng: -6.2944 },
  { id: 'a4', label: 'Trinity College Dublin', secondary: 'College Green, Dublin 2', lat: 53.3438, lng: -6.2546 },
  { id: 'a5', label: 'Grafton Street', secondary: 'Dublin 2', lat: 53.3418, lng: -6.2605 },
  { id: 'a6', label: 'St Stephen’s Green', secondary: 'Dublin 2', lat: 53.3382, lng: -6.2591 },
  { id: 'a7', label: 'Temple Bar', secondary: 'Dublin 2', lat: 53.3453, lng: -6.2634 },
  { id: 'a8', label: 'IFSC', secondary: 'North Wall Quay, Dublin 1', lat: 53.3487, lng: -6.2456 },
  { id: 'a9', label: 'The Convention Centre Dublin', secondary: 'Spencer Dock, North Wall Quay', lat: 53.3479, lng: -6.2384 },
  { id: 'a10', label: 'Croke Park', secondary: 'Jones’ Rd, Drumcondra, Dublin 3', lat: 53.3607, lng: -6.2512 },
  { id: 'a11', label: 'Aviva Stadium', secondary: 'Lansdowne Rd, Ballsbridge, Dublin 4', lat: 53.3352, lng: -6.2284 },
  { id: 'a12', label: 'RDS Dublin', secondary: 'Merrion Rd, Ballsbridge, Dublin 4', lat: 53.3299, lng: -6.2231 },
  { id: 'a13', label: 'UCD Belfield Campus', secondary: 'Belfield, Dublin 4', lat: 53.3067, lng: -6.2222 },
  { id: 'a14', label: 'St James’s Hospital', secondary: 'James’s St, Dublin 8', lat: 53.3406, lng: -6.2939 },
  { id: 'a15', label: 'Phoenix Park', secondary: 'Dublin 8', lat: 53.3554, lng: -6.3298 },
  { id: 'a16', label: 'Dundrum Town Centre', secondary: 'Sandyford Rd, Dundrum, Dublin 16', lat: 53.2903, lng: -6.2444 },
  { id: 'a17', label: 'Dun Laoghaire Harbour', secondary: 'Co. Dublin', lat: 53.2947, lng: -6.1296 },
  { id: 'a18', label: 'Blanchardstown Centre', secondary: 'Dublin 15', lat: 53.3865, lng: -6.3811 },
  { id: 'a19', label: 'Liffey Valley Shopping Centre', secondary: 'Fonthill Rd, Clondalkin', lat: 53.3521, lng: -6.4126 },
  { id: 'a20', label: 'Grand Canal Dock', secondary: 'Dublin 2', lat: 53.3441, lng: -6.2384 },
]

export function searchAddresses(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return ADDRESS_BOOK.filter(
    (a) => a.label.toLowerCase().includes(q) || a.secondary.toLowerCase().includes(q)
  ).slice(0, 6)
}
