<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent only once a booking is genuinely confirmed — immediately for
 * pay-in-car bookings, or from the Stripe webhook after a card payment
 * actually succeeds. Never sent on the strength of a frontend "success"
 * callback alone.
 */
class BookingConfirmed extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Booking $booking)
    {
        $this->booking->loadMissing('vehicleType');
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $booking = $this->booking;
        $paid = $booking->payment_method === 'card' && $booking->payment?->status === 'succeeded';

        $message = (new MailMessage)
            ->subject("Booking confirmed — {$booking->reference}")
            ->greeting("Thanks, {$notifiable->first_name}!")
            ->line('Your taxi booking has been confirmed.')
            ->line("**Booking reference:** {$booking->reference}")
            ->line("**Pickup:** {$booking->pickup['label']}")
            ->line("**Destination:** {$booking->destination['label']}")
            ->line('**Vehicle:** '.($booking->vehicleType->name ?? 'Taxi'))
            ->line('**Payment method:** '.($booking->payment_method === 'card' ? 'Card' : 'Pay in car'))
            ->line('**Fare:** '.number_format((float) $booking->fare, 2).' '.$booking->currency);

        if ($booking->payment_method === 'card') {
            $message->line('**Payment status:** '.($paid ? 'Paid' : 'Pending'));
        }

        if ($booking->is_scheduled && $booking->scheduled_for) {
            $message->line('**Scheduled for:** '.$booking->scheduled_for->format('D j M, H:i'));
        }

        return $message->line('You can track this booking any time from your account.');
    }
}
