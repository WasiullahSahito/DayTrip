import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  Plane,
  MessageSquare,
  Mail,
  User,
  Wallet,
  CreditCard,
  RotateCcw,
  Car,
  Users,
  Hourglass,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PhoneField from '../../components/ui/PhoneField'
import Switch from '../../components/ui/Switch'
import RouteFieldsPanel from '../../components/booking/RouteFieldsPanel'
import RouteMap from '../../components/booking/RouteMap'
import CollapsibleRow from '../../components/booking/CollapsibleRow'
import VehiclePickerModal from '../../components/booking/VehiclePickerModal'
import PaymentPickerModal from '../../components/booking/PaymentPickerModal'
import StripePaymentModal from '../../components/booking/StripePaymentModal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { findVehicle, capacityError } from '../../data/vehicles'
import { useFareSettings } from '../../hooks/useFareSettings'
import { useDebounce } from '../../hooks/useDebounce'
import * as bookingService from '../../services/bookingService'
import * as paymentService from '../../services/paymentService'
import { formatCurrency } from '../../utils/format'
import { isValidPhone, isNotEmpty, isValidEmail } from '../../utils/validators'

// Module-scope, computed once at import time (not during render) — a safe place for a "now" snapshot.
const TODAY = new Date().toISOString().slice(0, 10)
const DEFAULT_RETURN_TIME = new Date(Date.now() + 3 * 3600000).toTimeString().slice(0, 5)

export default function NewBooking() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const rebook = location.state?.rebook

  const [pickup, setPickup] = useState(rebook?.pickup || null)
  const [destination, setDestination] = useState(rebook?.destination || null)
  const [stops, setStops] = useState(rebook?.stops || [])

  const [timeMode, setTimeMode] = useState('now')
  const [pickupDate, setPickupDate] = useState(TODAY)
  const [pickupTime, setPickupTime] = useState('')

  const [vehicleId, setVehicleId] = useState(rebook?.vehicle?.id || 'any')
  const [passengers, setPassengers] = useState(String(rebook?.passengers || 1))
  const [waitingMinutes, setWaitingMinutes] = useState(String(rebook?.waitingMinutes ?? 0))
  const [quotes, setQuotes] = useState({})
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  const [vehiclePickerOpen, setVehiclePickerOpen] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState(null)
  const [cards, setCards] = useState([])
  const [paymentPickerOpen, setPaymentPickerOpen] = useState(false)

  const [passengerName, setPassengerName] = useState(`${user?.firstName || ''} ${user?.lastName || ''}`.trim())
  const [phone, setPhone] = useState(user?.phone || '')
  const [notes, setNotes] = useState('')
  const [flightNumber, setFlightNumber] = useState('')
  const [confirmationEmail, setConfirmationEmail] = useState(user?.email || '')

  const [returnEnabled, setReturnEnabled] = useState(false)
  const [returnTime, setReturnTime] = useState(DEFAULT_RETURN_TIME)

  const [errors, setErrors] = useState({})
  const [booking, setBooking] = useState(false)
  const [pendingPaymentBookingId, setPendingPaymentBookingId] = useState(null)

  const selectedVehicle = findVehicle(vehicleId)
  const FARE = useFareSettings()
  const passengerCount = parseInt(passengers, 10) || 0
  const waitingCount = Math.min(Math.max(parseInt(waitingMinutes, 10) || 0, 0), FARE.maxWaitingMinutes)
  const seatError = passengerCount >= 1 ? capacityError(selectedVehicle, passengerCount) : null
  const quotePassengers = useDebounce(Math.max(passengerCount, 1))
  const quoteWaiting = useDebounce(waitingCount)
  const hasRoute = pickup && destination
  const quote = hasRoute ? quotes[vehicleId] : undefined
  const isAirportPickup = pickup?.label.toLowerCase().includes('airport')

  useEffect(() => {
    paymentService.getCards().then((c) => {
      setCards(c)
      const def = c.find((card) => card.isDefault)
      setPaymentMethod(def ? { type: 'card', cardId: def.id } : { type: 'cash' })
    })
  }, [])

  useEffect(() => {
    if (!pickup || !destination) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-change pattern: flip the loading flag before the async call starts
    setLoadingQuotes(true)

    // A single server-side call quotes every active vehicle type for this
    // route at once — the backend computes distance and fare itself from
    // the coordinates, so nothing about the price ever originates client-side.
    bookingService
      .getQuotesForRoute({ pickup, destination, passengers: quotePassengers, waitingMinutes: quoteWaiting })
      .then((map) => {
        // "Any Taxi" isn't a real backend vehicle type — it's the frontend's
        // default-before-choosing pseudo-option, priced the same as Saloon.
        if (!cancelled) setQuotes({ ...map, any: map.saloon })
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to get quote. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoadingQuotes(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup, destination, stops, quotePassengers, quoteWaiting])

  function update(setter, field) {
    return (e) => {
      setter(e.target.value)
      setErrors((err) => ({ ...err, [field]: undefined }))
    }
  }

  function validate() {
    const next = {}
    if (!pickup) next.pickup = 'A pickup address is required'
    if (!destination) next.destination = 'A destination address is required'
    if (stops.some((s) => !s)) next.stops = 'Please complete or remove any empty stops'
    if (passengerCount < 1) next.passengers = 'Enter at least 1 passenger'
    else if (seatError) next.passengers = seatError
    if (waitingCount !== (parseInt(waitingMinutes, 10) || 0)) next.waitingMinutes = 'Waiting time is charged for one hour at most'
    if (!isNotEmpty(passengerName)) next.passengerName = 'Passenger name is required'
    if (!isValidPhone(phone)) next.phone = 'Please enter a valid phone number'
    if (confirmationEmail && !isValidEmail(confirmationEmail)) next.confirmationEmail = 'Please enter a valid email address'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleBook() {
    if (!validate()) {
      toast.error('Please check the highlighted fields.')
      return
    }
    setBooking(true)
    try {
      const scheduledFor =
        timeMode === 'later' && pickupTime ? new Date(`${pickupDate}T${pickupTime}`).getTime() : null
      const result = await bookingService.createBooking({
        pickup,
        destination,
        stops: stops.filter(Boolean),
        scheduledFor,
        vehicle: { ...selectedVehicle },
        passengers: passengerCount,
        waitingMinutes: waitingCount,
        passengerName,
        phone,
        notes,
        flightNumber,
        confirmationEmail,
        paymentMethod,
        returnJourney: returnEnabled ? { time: returnTime } : null,
      })

      if (result.status === 'pending_payment') {
        // Card bookings aren't confirmed yet — the backend created the
        // booking but is waiting on a real Stripe payment before it's
        // marked confirmed and the confirmation email goes out.
        setPendingPaymentBookingId(result.id)
        return
      }

      toast.success('Booking confirmed!')
      navigate(`/app/active/${result.id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to make booking. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  const paymentLabel =
    paymentMethod?.type === 'cash'
      ? 'Pay in car'
      : (() => {
          const card = cards.find((c) => c.id === paymentMethod?.cardId)
          return card ? `${card.brand} •••• ${card.last4}` : 'Choose payment method'
        })()

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        <div className="order-2 space-y-4 lg:order-1">
          <div>
            <RouteFieldsPanel
              pickup={pickup}
              destination={destination}
              stops={stops}
              onPickupChange={setPickup}
              onDestinationChange={setDestination}
              onStopsChange={setStops}
            />
            {(errors.pickup || errors.destination || errors.stops) && (
              <p className="mt-1.5 text-xs font-medium text-danger">{errors.pickup || errors.destination || errors.stops}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DateField mode={timeMode} date={pickupDate} onDateChange={setPickupDate} onActivate={() => setTimeMode('later')} />
            <TimeField
              mode={timeMode}
              time={pickupTime}
              onTimeChange={setPickupTime}
              onActivate={() => setTimeMode('later')}
              onReset={() => {
                setTimeMode('now')
                setPickupTime('')
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Passenger Name"
              icon={<User className="size-4.5" />}
              value={passengerName}
              onChange={update(setPassengerName, 'passengerName')}
              error={errors.passengerName}
            />
            <PhoneField
              label="Passenger Phone Number"
              value={phone}
              onChange={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: undefined })) }}
              error={errors.phone}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Number of Passengers"
              icon={<Users className="size-4.5" />}
              type="number"
              min="1"
              step="1"
              value={passengers}
              onChange={update(setPassengers, 'passengers')}
              error={errors.passengers || seatError}
              hint={`+${formatCurrency(FARE.perPassenger)} per passenger`}
            />
            <Input
              label="Waiting Time (minutes)"
              icon={<Hourglass className="size-4.5" />}
              type="number"
              min="0"
              max={FARE.maxWaitingMinutes}
              step="1"
              value={waitingMinutes}
              onChange={update(setWaitingMinutes, 'waitingMinutes')}
              error={errors.waitingMinutes}
              hint={`${formatCurrency(FARE.waitingPerMinute)} per minute, charged for one hour at most`}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Notes for Driver"
              icon={<MessageSquare className="size-4.5" />}
              placeholder="e.g. Side entrance"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Input
              label="Send Booking Confirmation To"
              icon={<Mail className="size-4.5" />}
              type="email"
              placeholder="you@example.com"
              value={confirmationEmail}
              onChange={update(setConfirmationEmail, 'confirmationEmail')}
              error={errors.confirmationEmail}
            />
          </div>

          {isAirportPickup && (
            <Input
              label="Flight number (optional)"
              icon={<Plane className="size-4.5" />}
              placeholder="e.g. EI164"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
            />
          )}

          <CollapsibleRow
            icon={<Car className="size-5" />}
            title={selectedVehicle?.name}
            subtitle={
              hasRoute && loadingQuotes
                ? 'Calculating fare…'
                : quote
                  ? `${formatCurrency(quote.fare)} · ${selectedVehicle?.tagline || `${selectedVehicle?.passengers} passengers`}`
                  : selectedVehicle?.tagline || `${selectedVehicle?.passengers} passengers`
            }
            onClick={() => setVehiclePickerOpen(true)}
          />

          <CollapsibleRow
            icon={paymentMethod?.type === 'cash' ? <Wallet className="size-5" /> : <CreditCard className="size-5" />}
            title="Payment method"
            subtitle={paymentLabel}
            onClick={() => setPaymentPickerOpen(true)}
          />

          <div className="rounded-2xl border border-border bg-white p-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setReturnEnabled((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setReturnEnabled((v) => !v)
                }
              }}
              className="flex w-full items-center gap-3.5 text-left cursor-pointer"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink">
                <RotateCcw className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">Book Return Journey</span>
                <span className="block text-sm text-ink-soft">Optional</span>
              </span>
              <Switch checked={returnEnabled} onChange={setReturnEnabled} label="Book return journey" />
            </div>
            {returnEnabled && (
              <div className="mt-4 border-t border-border pt-4">
                <label className="block max-w-[200px]">
                  <span className="mb-1.5 block text-sm font-medium text-ink">Return pickup time</span>
                  <div className="flex h-12 items-center rounded-xl border border-border bg-white px-3.5">
                    <Clock className="mr-2.5 size-4.5 text-ink-soft" />
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="flex-1 bg-transparent text-[15px] font-medium text-ink focus:outline-none"
                    />
                  </div>
                </label>
                <p className="mt-2 text-xs text-ink-soft">
                  We’ll book a return trip from {destination?.label || 'your destination'} back to {pickup?.label || 'your pickup point'}.
                </p>
              </div>
            )}
          </div>

          <Button fullWidth size="lg" loading={booking} onClick={handleBook}>
            {booking ? 'Confirming your booking…' : 'Book'}
          </Button>
        </div>

        <div className="order-1 lg:order-2">
          <RouteMap
            pickup={pickup}
            destination={destination}
            stops={stops}
            className="aspect-4/3 w-full lg:sticky lg:top-24 lg:aspect-auto lg:h-[calc(100vh-8rem)]"
          />
        </div>
      </div>

      <VehiclePickerModal
        open={vehiclePickerOpen}
        onClose={() => setVehiclePickerOpen(false)}
        value={vehicleId}
        onChange={setVehicleId}
      />
      <PaymentPickerModal
        open={paymentPickerOpen}
        onClose={() => setPaymentPickerOpen(false)}
        value={paymentMethod}
        onChange={setPaymentMethod}
      />
      <StripePaymentModal
        open={!!pendingPaymentBookingId}
        bookingId={pendingPaymentBookingId}
        cardId={paymentMethod?.cardId}
        onClose={() => setPendingPaymentBookingId(null)}
        onSuccess={() => {
          const id = pendingPaymentBookingId
          setPendingPaymentBookingId(null)
          toast.success('Payment received — booking confirmed!')
          navigate(`/app/active/${id}`)
        }}
      />
    </div>
  )
}

function DateField({ mode, date, onDateChange, onActivate }) {
  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">Pickup Date</span>
      <div className="flex h-12 items-center rounded-xl border border-border bg-white px-3.5">
        <Calendar className="mr-2.5 size-4.5 shrink-0 text-ink-soft" />
        {mode === 'now' ? (
          <button type="button" onClick={onActivate} className="flex-1 text-left text-[15px] font-medium text-ink cursor-pointer">
            Today
          </button>
        ) : (
          <input
            type="date"
            aria-label="Pickup Date"
            value={date}
            min={TODAY}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full flex-1 bg-transparent text-[15px] font-medium text-ink focus:outline-none"
          />
        )}
      </div>
    </div>
  )
}

function TimeField({ mode, time, onTimeChange, onActivate, onReset }) {
  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">Pickup Time</span>
      <div className="flex h-12 items-center rounded-xl border border-border bg-white px-3.5">
        <Clock className="mr-2.5 size-4.5 shrink-0 text-ink-soft" />
        {mode === 'now' ? (
          <button type="button" onClick={onActivate} className="flex-1 text-left text-[15px] font-medium text-ink cursor-pointer">
            Now
          </button>
        ) : (
          <>
            <input
              type="time"
              aria-label="Pickup Time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full flex-1 bg-transparent text-[15px] font-medium text-ink focus:outline-none"
            />
            <button type="button" onClick={onReset} className="ml-2 shrink-0 text-xs font-semibold text-ink-soft hover:text-ink cursor-pointer">
              Now
            </button>
          </>
        )}
      </div>
    </div>
  )
}
