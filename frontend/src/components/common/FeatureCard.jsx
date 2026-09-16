import Card from '../ui/Card'

export default function FeatureCard({ icon, title, description, bare = false }) {
  const content = (
    <>
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary-light text-ink">{icon}</span>
      <h3 className="mt-4 font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{description}</p>
    </>
  )

  if (bare) {
    return <div>{content}</div>
  }

  return <Card className="h-full !p-6">{content}</Card>
}
