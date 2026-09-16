import SectionTitle from '../common/SectionTitle'
import FeatureCard from '../common/FeatureCard'

// Shared grid used for both "Features" and "Benefits" sections across sector
// pages — same structure, different data, so one component covers both
// rather than maintaining near-identical twins.
export default function FeatureSection({ id, eyebrow, title, description, items, columns = 3 }) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 scroll-mt-20">
      <SectionTitle eyebrow={eyebrow} title={title} description={description} />
      <div className={`mt-12 grid gap-5 sm:grid-cols-2 ${columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {items.map((item) => (
          <FeatureCard key={item.title} icon={<item.icon className="size-5" />} title={item.title} description={item.desc} />
        ))}
      </div>
    </section>
  )
}
