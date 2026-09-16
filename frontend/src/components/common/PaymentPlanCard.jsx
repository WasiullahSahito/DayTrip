import { Check } from 'lucide-react'
import clsx from 'clsx'
import Card from '../ui/Card'
import CTAButton from './CTAButton'

export default function PaymentPlanCard({ plan }) {
  return (
    <Card className={clsx('flex h-full flex-col !p-7', plan.highlight && 'border-primary ring-2 ring-primary/40')}>
      {plan.highlight && (
        <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-ink">
          Most popular
        </span>
      )}
      <h3 className="text-xl font-bold text-ink">{plan.label}</h3>
      <p className="mt-0.5 text-sm font-semibold text-ink-soft">{plan.subLabel}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{plan.description}</p>
      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-7">
        <CTAButton
          to="/register"
          state={{ accountType: plan.id }}
          fullWidth
          variant={plan.highlight ? 'primary' : 'outline'}
        >
          Choose {plan.label}
        </CTAButton>
      </div>
    </Card>
  )
}
