// Mock address book standing in for a real geocoding provider (Google/Mapbox).
// Coordinates are approximate real-world Galway locations.
export const ADDRESS_BOOK = [
  { id: 'a1', label: 'Galway Airport (GWY)', secondary: 'Carnmore, Co. Galway', lat: 53.3011, lng: -8.9444 },
  { id: 'a2', label: 'Galway Coach Station', secondary: 'Eyre Square, Galway', lat: 53.2744, lng: -9.0495 },
  { id: 'a3', label: 'Ceannt Station', secondary: 'Forster St, Galway', lat: 53.2787, lng: -9.009 },
  { id: 'a4', label: 'University of Galway', secondary: 'University Rd, Galway', lat: 53.2793, lng: -9.0617 },
  { id: 'a5', label: 'Eyre Square', secondary: 'Galway City Centre', lat: 53.2741, lng: -9.0492 },
  { id: 'a6', label: 'Spanish Arch', secondary: 'Galway City Centre', lat: 53.2702, lng: -9.0537 },
  { id: 'a7', label: 'Salthill Promenade', secondary: 'Galway', lat: 53.2645, lng: -9.0932 },
  { id: 'a8', label: 'The Quay', secondary: 'Galway City Centre', lat: 53.2724, lng: -9.0521 },
  { id: 'a9', label: 'Galway Cathedral', secondary: 'Newtownsmith, Galway', lat: 53.2728, lng: -9.0538 },
  { id: 'a10', label: 'Ballybrit Business Park', secondary: 'Galway', lat: 53.2798, lng: -8.9995 },
  { id: 'a11', label: 'Westside', secondary: 'Galway', lat: 53.2809, lng: -9.0749 },
  { id: 'a12', label: 'Mervue', secondary: 'Galway', lat: 53.2872, lng: -9.0105 },
  { id: 'a13', label: 'Oranmore', secondary: 'Galway', lat: 53.2863, lng: -8.9376 },
  { id: 'a14', label: 'Barna', secondary: 'Galway', lat: 53.2551, lng: -9.4479 },
  { id: 'a15', label: 'Tuam Road', secondary: 'Galway', lat: 53.2867, lng: -9.0471 },
  { id: 'a16', label: 'Claddagh', secondary: 'Galway', lat: 53.2675, lng: -9.0522 },
  { id: 'a17', label: 'Roscam', secondary: 'Galway', lat: 53.2876, lng: -8.9935 },
  { id: 'a18', label: 'Lough Atalia', secondary: 'Galway', lat: 53.2696, lng: -9.0141 },
  { id: 'a19', label: 'Headford Road', secondary: 'Galway', lat: 53.2769, lng: -9.0771 },
  { id: 'a20', label: 'Galway Harbour', secondary: 'Galway', lat: 53.2725, lng: -9.0515 },
]

export function searchAddresses(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return ADDRESS_BOOK.filter(
    (a) => a.label.toLowerCase().includes(q) || a.secondary.toLowerCase().includes(q)
  ).slice(0, 6)
}
