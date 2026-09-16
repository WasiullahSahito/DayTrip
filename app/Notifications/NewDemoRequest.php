<?php

namespace App\Notifications;

use App\Models\DemoRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewDemoRequest extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public DemoRequest $demoRequest) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $d = $this->demoRequest;

        return (new MailMessage)
            ->subject("New demo request: {$d->company_name}")
            ->line("Company: {$d->company_name}")
            ->line("Contact: {$d->name} ({$d->email}, {$d->phone})")
            ->line("Business type: {$d->business_type}")
            ->line('Users: '.($d->users_count ?: 'not specified'))
            ->line($d->message ?: 'No additional message.');
    }
}
