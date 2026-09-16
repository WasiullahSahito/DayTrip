import { useState } from 'react'
import { Calculator, ArrowRight } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import Card from '../../components/ui/Card'
import CTAButton from '../../components/common/CTAButton'
import AddressField from '../../components/booking/AddressField'
import RouteMap from '../../components/booking/RouteMap'
import VehicleCard from '../../components/booking/VehicleCard'
import { VEHICLE_TYPES, haversineKm, estimateFare } from '../../data/vehicles'

export default function FareEstimator() {
  usePageMeta('Fare Estimator | Lynk', "Calculate your journey's cost estimate before you book.")

  const [pickup, setPickup] = useState(null)
  const [destination, setDestination] = useState(null)
  const [vehicleId, setVehicleId] = useState(VEHICLE_TYPES[0].id)

  const hasRoute = pickup && destination
  let distanceKm = 0
  let durationMin = 0
  if (hasRoute) {
    distanceKm = haversineKm(pickup, destination) * 1.35
    durationMin = (distanceKm / 28) * 60
  }

  const selectedVehicle = VEHICLE_TYPES.find((v) => v.id === vehicleId)

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1.5 text-xs font-bold text-ink">
          <Calculator className="size-3.5" /> Fare Estimator
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Your fare guide
        </h1>
        <p className="mt-3 text-ink-soft">
          Calculate your journey's cost estimate with ease — enter a pickup and destination below.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        <div className="space-y-4">
          <Card className="space-y-3 !p-5">
            <AddressField label="Pickup location" placeholder="Enter pickup address" value={pickup} onChange={setPickup} tone="pickup" />
            <AddressField label="Destination" placeholder="Where to?" value={destination} onChange={setDestination} tone="destination" />
          </Card>

          <div className="space-y-3">
            {VEHICLE_TYPES.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                fare={hasRoute ? estimateFare(v, distanceKm, durationMin) : 0}
                selected={vehicleId === v.id}
                onSelect={() => setVehicleId(v.id)}
              />
            ))}
          </div>

          <CTAButton
            to="/register"
            state={{ rebook: { pickup, destination, stops: [], vehicle: selectedVehicle } }}
            fullWidth
            size="lg"
            disabled={!hasRoute}
          >
            Book this ride <ArrowRight className="size-4.5" />
          </CTAButton>
          <p className="text-center text-xs text-ink-soft">
            Fares shown are estimates. Create a free account to confirm and book.
          </p>
        </div>

        <RouteMap pickup={pickup} destination={destination} className="aspect-4/3 w-full lg:sticky lg:top-24 lg:aspect-auto lg:h-[560px]" />
      </div>
    </div>
  )
}
