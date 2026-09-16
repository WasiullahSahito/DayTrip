import CTABand from './CTABand'

export default function BookingCTA({ title = 'Ready to book?', description = 'Get a taxi on the road in minutes — no account required to see a fare.' }) {
  return (
    <CTABand
      title={title}
      description={description}
      primary={{ label: 'Book online', to: '/book' }}
      secondary={{ label: 'Register for free', to: '/register' }}
    />
  )
}
