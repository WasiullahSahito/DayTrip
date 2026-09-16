import CTABand from './CTABand'

export default function ContactCTA({ title = 'Still have questions?', description = 'Our team is happy to talk through the right setup for your organisation.' }) {
  return (
    <CTABand
      title={title}
      description={description}
      primary={{ label: 'Contact us', to: '/contact' }}
      secondary={{ label: 'Get a demo', to: '/get-demo' }}
      dark={false}
    />
  )
}
