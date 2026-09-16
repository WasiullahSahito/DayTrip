import { QrCode, Smartphone, Zap } from 'lucide-react'
import Card from '../ui/Card'
import CTAButton from '../common/CTAButton'
import SectionTitle from '../common/SectionTitle'

export default function QrSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Card className="grid gap-8 !p-8 sm:!p-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionTitle
            align="left"
            eyebrow="QR Taxi Booker"
            title="A code on the counter. A taxi at the door."
            description="Print a QR code for reception, the lobby, or every guest room. Guests scan it with their phone camera — no app, no account, no hold music."
            className="mx-0 max-w-none"
          />
          <ul className="mt-6 space-y-3 text-sm text-ink-soft">
            <li className="flex items-start gap-2.5">
              <Smartphone className="mt-0.5 size-4.5 shrink-0 text-ink" /> Opens straight in the guest's browser — nothing to install.
            </li>
            <li className="flex items-start gap-2.5">
              <Zap className="mt-0.5 size-4.5 shrink-0 text-ink" /> Pickup location is pre-filled to your property automatically.
            </li>
          </ul>
          <div className="mt-7">
            <CTAButton to="/business/qr-booker" size="lg">
              Get your QR code
            </CTAButton>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex size-56 items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface-muted">
            <QrCode className="size-28 text-ink" strokeWidth={1} />
          </div>
        </div>
      </Card>
    </section>
  )
}
