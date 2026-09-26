import { useState } from 'react'
import { Calculator, ArrowRight } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import Card from '../../components/ui/Card'
import CTAButton from '../../components/common/CTAButton'
import AddressField from '../../components/booking/AddressField'
import RouteMap from '../../components/booking/RouteMap'
import VehicleCard from '../../components/booking/VehicleCard'
import Input from '../../components/ui/Input'
import { VEHICLE_TYPES, haversineKm, estimateFare, capacityError } from '../../data/vehicles'
import { useFareSettings } from '../../hooks/useFareSettings'

export default function FareEstimator() {
  usePageMeta('Fare Estimator | DayTrip', "Calculate your journey's cost estimate before you book.")

  const [pickup, setPickup] = useState(null)
  const [destination, setDestination] = useState(null)
  const [vehicleId, setVehicleId] = useState(VEHICLE_TYPES[0].id)
  const [passengers, setPassengers] = useState('1')
  const [waitingMinutes, setWaitingMinutes] = useState('0')

  const hasRoute = pickup && destination
  let distanceKm = 0
  if (hasRoute) {
    distanceKm = haversineKm(pickup, destination) * 1.35
  }

  const selectedVehicle = VEHICLE_TYPES.find((v) => v.id === vehicleId)
  const FARE = useFareSettings()
  const passengerCount = parseInt(passengers, 10) || 0
  const waitingCount = Math.min(Math.max(parseInt(waitingMinutes, 10) || 0, 0), FARE.maxWaitingMinutes)
  const seatError = passengerCount >= 1 ? capacityError(selectedVehicle, passengerCount) : null
  const canBook = hasRoute && passengerCount >= 1 && !seatError
  const fare = estimateFare(distanceKm, Math.max(passengerCount, 1), waitingCount, FARE)

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

          <Card className="grid gap-3 !p-5 sm:grid-cols-2">
            <Input
              label="Number of passengers"
              type="number"
              min="1"
              step="1"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              error={seatError || (passengerCount < 1 ? 'Enter at least 1 passenger' : undefined)}
              hint={`+${FARE.perPassenger.toFixed(2)} € per passenger`}
            />
            <Input
              label="Waiting time (minutes)"
              type="number"
              min="0"
              max={FARE.maxWaitingMinutes}
              step="1"
              value={waitingMinutes}
              onChange={(e) => setWaitingMinutes(e.target.value)}
              hint={`${FARE.waitingPerMinute.toFixed(2)} € per minute, one hour at most`}
            />
          </Card>

          <div className="space-y-3">
            {VEHICLE_TYPES.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                fare={hasRoute ? fare : 0}
                selected={vehicleId === v.id}
                onSelect={() => setVehicleId(v.id)}
              />
            ))}
          </div>

          <CTAButton
            to="/register"
            state={{ rebook: { pickup, destination, stops: [], vehicle: selectedVehicle, passengers: passengerCount } }}
            fullWidth
            size="lg"
            disabled={!canBook}
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
