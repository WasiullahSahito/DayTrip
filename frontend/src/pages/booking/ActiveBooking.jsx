import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Phone, MessageSquare, X, Star, PartyPopper, Send } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import RouteMap from '../../components/booking/RouteMap'
import StripePaymentModal from '../../components/booking/StripePaymentModal'
import { STATUS_META } from '../../components/booking/statusMeta'
import * as bookingService from '../../services/bookingService'
import * as paymentService from '../../services/paymentService'
import { useToast } from '../../context/ToastContext'
import { formatCurrency, formatTime, relativeMinutes, initials } from '../../utils/format'

const PROGRESS_BY_STATUS = {
  scheduled: 0,
  searching: 0,
  driver_assigned: 0.05,
  driver_en_route: 0.4,
  driver_arrived: 1,
  in_progress: 1,
  completed: 1,
}

export default function ActiveBooking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [booking, setBooking] = useState(undefined)
  const [live, setLive] = useState(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showConfirmedBanner, setShowConfirmedBanner] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  // The customer's default saved card decides whether "Complete payment" charges a SumUp card or opens Stripe.
  const [defaultCardId, setDefaultCardId] = useState(null)

  useEffect(() => {
    paymentService
      .getCards()
      .then((cards) => setDefaultCardId(cards.find((c) => c.isDefault)?.id ?? null))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let mounted = true
    bookingService.getBooking(id).then((b) => {
      if (!mounted) return
      setBooking(b)
      if (b && !b.isScheduled && Date.now() - b.createdAt < 5000) {
        setShowConfirmedBanner(true)
        setTimeout(() => mounted && setShowConfirmedBanner(false), 4000)
      }
    })
    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    if (!booking) return
    function tick() {
      setLive(bookingService.computeLiveStatus(booking))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [booking])

  if (booking === undefined || !live) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Spinner label="Loading your booking…" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="font-semibold text-ink">We couldn’t find that booking.</p>
        <Button className="mt-4" onClick={() => navigate('/app/home')}>
          Back to home
        </Button>
      </div>
    )
  }

  const meta = STATUS_META[live.status]
  const canCancel = !['driver_arrived', 'in_progress', 'completed', 'cancelled'].includes(live.status)

  async function handleCancel() {
    setCancelling(true)
    try {
      const updated = await bookingService.cancelBooking(id)
      setBooking(updated)
      toast.success('Your booking has been cancelled.')
    } catch {
      toast.error('Failed to cancel booking. Please try again.')
    } finally {
      setCancelling(false)
      setCancelOpen(false)
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    await bookingService.messageDriver(id, message)
    setSending(false)
    setMessage('')
    setMessageOpen(false)
    toast.success('Message sent to your driver.')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {showConfirmedBanner && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-success-bg px-4 py-3.5 text-success animate-slide-down">
          <PartyPopper className="size-5 shrink-0" />
          <p className="text-sm font-semibold">
            Booking confirmed! Your reference is <strong>#{booking.reference}</strong>
          </p>
        </div>
      )}

      <RouteMap
        pickup={booking.pickup}
        destination={booking.destination}
        stops={booking.stops}
        driverProgress={PROGRESS_BY_STATUS[live.status]}
        className="aspect-[16/10] w-full sm:aspect-[16/8]"
      />

      <Card className="-mt-6 relative z-10 mx-2 !rounded-2xl !p-5 shadow-[var(--shadow-pop)] sm:mx-4">
        <div className="flex items-center justify-between">
          <Badge tone={meta.tone === 'primary' ? 'primary' : meta.tone}>{meta.label}</Badge>
          <span className="text-xs font-semibold text-ink-soft">#{booking.reference}</span>
        </div>
        <p className="mt-2.5 text-lg font-bold text-ink">
          {live.status === 'pending_payment' && 'Awaiting payment'}
          {live.status === 'scheduled' && `Pickup at ${formatTime(booking.scheduledFor)}`}
          {live.status === 'searching' && 'Finding your driver…'}
          {live.status === 'driver_assigned' && `Driver arriving in ${relativeMinutes(live.etaMins)}`}
          {live.status === 'driver_en_route' && `Driver arriving in ${relativeMinutes(live.etaMins)}`}
          {live.status === 'driver_arrived' && 'Your driver is waiting outside'}
          {live.status === 'in_progress' && `${relativeMinutes(live.etaMins)} to destination`}
          {live.status === 'completed' && 'Trip completed'}
          {live.status === 'cancelled' && 'Booking cancelled'}
        </p>
        <p className="text-sm text-ink-soft">{meta.description}</p>

        {['searching'].includes(live.status) && (
          <div className="mt-3 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 flex-1 animate-pulse-soft rounded-full bg-primary"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </Card>

      {booking.driver && live.status !== 'cancelled' && (
        <Card className="mt-4 !p-5">
          <div className="flex items-center gap-3.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
              {initials(booking.driver.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink">{booking.driver.name}</p>
              <p className="flex items-center gap-1 text-xs text-ink-soft">
                <Star className="size-3.5 fill-tertiary text-tertiary" /> {booking.driver.rating} &middot; {booking.driver.car}
              </p>
            </div>
            <p className="shrink-0 rounded-lg bg-surface-muted px-2.5 py-1.5 text-xs font-bold tracking-wide text-ink">
              {booking.driver.reg}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" icon={<Phone className="size-4" />} onClick={() => toast.info('Calling driver… (demo)')}>
              Call
            </Button>
            <Button variant="outline" icon={<MessageSquare className="size-4" />} onClick={() => setMessageOpen(true)}>
              Message
            </Button>
          </div>
        </Card>
      )}

      <Card className="mt-4 !p-5">
        <p className="mb-3 text-sm font-bold text-ink">Trip details</p>
        <div className="space-y-2 text-sm">
          <Row label="Vehicle" value={booking.vehicle.name} />
          <Row label="Distance" value={`${booking.distanceKm} km`} />
          <Row label="Passenger" value={booking.passengerName} />
          {booking.notes && <Row label="Notes" value={booking.notes} />}
          {booking.flightNumber && <Row label="Flight" value={booking.flightNumber} />}
          {booking.returnJourney && <Row label="Return journey" value={`Pickup at ${booking.returnJourney.time}`} />}
          <Row label="Fare" value={<span className="font-extrabold text-ink">{formatCurrency(booking.fare)}</span>} />
        </div>
      </Card>

      {live.status === 'pending_payment' && (
        <Button fullWidth className="mt-5" onClick={() => setPayOpen(true)}>
          Complete payment
        </Button>
      )}

      {canCancel && (
        <Button variant="outline" fullWidth className="mt-5 !text-danger !border-danger/30 hover:!bg-danger-bg" icon={<X className="size-4" />} onClick={() => setCancelOpen(true)}>
          Cancel booking
        </Button>
      )}

      <StripePaymentModal
        open={payOpen}
        bookingId={booking.id}
        cardId={defaultCardId}
        onClose={() => setPayOpen(false)}
        onSuccess={() => {
          setPayOpen(false)
          toast.success('Payment received — booking confirmed!')
          bookingService.getBooking(id).then(setBooking)
        }}
      />

      {live.status === 'completed' && (
        <Button fullWidth className="mt-5" onClick={() => navigate('/app/history')}>
          View in booking history
        </Button>
      )}

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel this booking?"
        description="This action cannot be undone. A cancellation fee may apply depending on driver proximity."
        confirmLabel="Yes, cancel"
      />

      <Modal open={messageOpen} onClose={() => setMessageOpen(false)} title={`Message ${booking.driver?.name || 'driver'}`} size="sm">
        <form onSubmit={handleSendMessage} className="space-y-3 pb-2">
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. I'm at the main entrance"
            className="w-full resize-none rounded-xl border border-border bg-white p-3.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button type="submit" fullWidth loading={sending} icon={<Send className="size-4" />}>
            Send
          </Button>
        </form>
      </Modal>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-ink-soft">{label}</span>
      <span className="truncate text-right font-semibold text-ink">{value}</span>
    </div>
  )
}
