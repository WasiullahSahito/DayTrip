<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Models\ContactMessage;
use Illuminate\Support\Facades\Notification;

class ContactController extends Controller
{
    use ApiResponses;

    public function store(ContactRequest $request)
    {
        $message = ContactMessage::create([
            ...$request->validated(),
            'user_id' => $request->user()?->id,
        ]);

        $adminEmail = config('services.admin.notification_email');
        if ($adminEmail) {
            Notification::route('mail', $adminEmail)
                ->notify(new \App\Notifications\NewContactMessage($message));
        }

        return $this->created(null, 'Thanks — we’ll be in touch shortly.');
    }
}
