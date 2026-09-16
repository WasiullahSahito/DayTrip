import { usePageMeta } from '../../hooks/usePageMeta'
import SectorHero from '../../components/business/SectorHero'
import FeatureSection from '../../components/business/FeatureSection'
import SecuritySection from '../../components/business/SecuritySection'
import QrSection from '../../components/business/QrSection'
import SolutionsForEverySector from '../../components/business/SolutionsForEverySector'
import CTABand from '../../components/common/CTABand'
import { SECTOR_CONTENT } from '../../data/sectorContent'
import { getSector } from '../../data/sectors'

const SEO_TITLES = {
  corporate: 'Corporate Taxi Services | Lynk',
  healthcare: 'Healthcare Taxi Services | Lynk',
  hospitality: 'Hospitality Taxi Services | Lynk',
  'public-sector': 'Public Sector Taxi Services | Lynk',
}

export default function SectorPage({ sectorKey }) {
  const content = SECTOR_CONTENT[sectorKey]
  const sector = getSector(sectorKey)

  usePageMeta(SEO_TITLES[sectorKey], content.heroDescription)

  return (
    <div>
      <SectorHero
        eyebrow={content.eyebrow}
        title={content.heroTitle}
        description={content.heroDescription}
        bullets={content.heroBullets}
        primaryCta={content.primaryCta}
        secondaryCta={content.secondaryCta}
        Icon={sector.icon}
      />

      <FeatureSection
        eyebrow="What we offer"
        title={`${sector.title} solutions`}
        description={`Purpose-built features for ${sector.title.toLowerCase()} transport.`}
        items={content.features}
      />

      {content.showQr && <QrSection />}

      <FeatureSection
        id="benefits"
        eyebrow="Why teams choose Lynk"
        title="Benefits for your organisation"
        items={content.benefits}
        columns={4}
      />

      {content.showSecurity && <SecuritySection />}

      <SolutionsForEverySector excludeId={sectorKey} muted={!content.showSecurity} />

      <CTABand
        title={content.ctaBand.title}
        description={content.ctaBand.description}
        primary={content.ctaBand.primary}
        secondary={content.ctaBand.secondary}
      />
    </div>
  )
}
