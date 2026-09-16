import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Card from '../ui/Card'

export default function SectorCard({ icon, title, subtitle, description, route, highlight = false }) {
  return (
    <Link to={route} className="block h-full">
      <Card
        className={
          'flex h-full flex-col !p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)] ' +
          (highlight ? 'border-primary ring-2 ring-primary/30' : '')
        }
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-light text-ink">{icon}</span>
        <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
        <p className="mt-0.5 text-sm font-semibold text-ink-soft">{subtitle}</p>
        {description && <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-soft">{description}</p>}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink">
          Learn more <ArrowRight className="size-4" />
        </span>
      </Card>
    </Link>
  )
}
