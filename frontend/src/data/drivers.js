export const MOCK_DRIVERS = [
  { name: 'Seán Byrne', rating: 4.9, reg: '141-D-45231', car: 'Toyota Prius', color: 'Silver' },
  { name: 'Aisling Kelly', rating: 4.8, reg: '192-D-11823', car: 'Skoda Octavia', color: 'Black' },
  { name: 'Cian O’Sullivan', rating: 5.0, reg: '182-D-33012', car: 'Toyota Corolla', color: 'White' },
  { name: 'Niamh Walsh', rating: 4.7, reg: '201-D-77410', car: 'Hyundai Ioniq', color: 'Blue' },
  { name: 'Darragh Ryan', rating: 4.9, reg: '171-D-90042', car: 'Volkswagen Passat', color: 'Grey' },
]

export function pickDriver(seed = 0) {
  return MOCK_DRIVERS[seed % MOCK_DRIVERS.length]
}
