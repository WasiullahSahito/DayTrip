<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\DemoRequestRequest;
use App\Models\DemoRequest;
use App\Notifications\NewDemoRequest;
use Illuminate\Support\Facades\Notification;

class DemoRequestController extends Controller
{
    use ApiResponses;

    public function store(DemoRequestRequest $request)
    {
        $data = $request->validated();

        $demoRequest = DemoRequest::create([
            'company_name' => $data['companyName'],
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'business_type' => $data['businessType'],
            'users_count' => $data['users'] ?? null,
            'message' => $data['message'] ?? null,
        ]);

        $adminEmail = config('services.admin.notification_email');
        if ($adminEmail) {
            Notification::route('mail', $adminEmail)->notify(new NewDemoRequest($demoRequest));
        }

        return $this->created(null, 'Demo request sent — we’ll be in touch shortly.');
    }
}
