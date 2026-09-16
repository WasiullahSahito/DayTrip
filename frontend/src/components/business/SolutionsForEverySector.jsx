import SectionTitle from '../common/SectionTitle'
import SectorCard from '../common/SectorCard'
import { SECTORS } from '../../data/sectors'

// Cross-navigation grid shown on /business and every sector page, per the
// "sector pages must link to each other" requirement. `excludeId` drops the
// current page from its own list so it reads as "explore the others."
export default function SolutionsForEverySector({ excludeId, title = 'Solutions for every sector', muted = false }) {
  const sectors = excludeId ? SECTORS.filter((s) => s.id !== excludeId) : SECTORS

  return (
    <section className={`py-20 ${muted ? 'bg-surface-muted' : ''}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Sectors"
          title={title}
          description="Whatever your organisation does, there's a Lynk Business solution built for it."
        />
        <div className={`mt-12 grid gap-6 sm:grid-cols-2 ${sectors.length > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {sectors.map((s) => (
            <SectorCard
              key={s.id}
              icon={<s.icon className="size-6" />}
              title={s.title}
              subtitle={s.subtitle}
              description={s.description}
              route={s.route}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
