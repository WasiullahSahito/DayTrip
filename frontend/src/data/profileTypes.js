// Mirrors the real /api/config profileTypes payload.
export const PROFILE_TYPES = [
  {
    id: 'personal',
    type: 'personal',
    label: 'Personal',
    subLabel: 'Cash or Card-Pay',
    description: 'A classic no-frills option for everyday journeys.',
    features: ['Pay in car', '7-day booking history', 'App, web & phone booking'],
  },
  {
    id: 'business',
    type: 'business',
    label: 'Business',
    subLabel: 'Card-Pay · Pay as you go',
    description: 'Give your team a fast, accountable way to travel.',
    features: [
      'Instant payments',
      'App, web & phone booking',
      'Priority booking',
      'Expense reports',
      'Up to 10 users',
    ],
    highlight: true,
  },
  {
    id: 'business-plus',
    type: 'business',
    label: 'Business+',
    subLabel: 'Bill-Pay · Invoice',
    description: 'Book now, pay later with centralised billing.',
    features: [
      'Book now — pay later',
      'App, web & phone booking',
      'Weekly / monthly invoicing',
      'Expense reports',
      'Priority booking',
      'Dedicated account manager',
      'Unlimited users',
      'Security pins & passwords',
    ],
  },
]
