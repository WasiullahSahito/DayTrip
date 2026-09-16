<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssignDriverRequest;
use App\Http\Requests\Admin\UpdateBookingStatusRequest;
use App\Http\Resources\Admin\AdminBookingResource;
use App\Models\Booking;
use App\Models\Driver;
use App\Services\BookingService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    use ApiResponses;

    public function __construct(private BookingService $bookings) {}

    /**
     * Lists bookings across every user — the customer-facing
     * Api\BookingController::index is always scoped to $request->user(),
     * this deliberately is not. No authorize() call: the `admin` middleware
     * on the route group is the entire authorization boundary here.
     */
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'vehicleType'])->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhere('passenger_name', 'like', "%{$search}%");
            });
        }

        $bookings = $query->paginate(min((int) $request->query('per_page', 20), 50));

        return $this->ok([
            'data' => AdminBookingResource::collection($bookings->items()),
            'meta' => [
                'currentPage' => $bookings->currentPage(),
                'lastPage' => $bookings->lastPage(),
                'perPage' => $bookings->perPage(),
                'total' => $bookings->total(),
            ],
        ]);
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking)
    {
        $booking = $this->bookings->updateStatus($booking, $request->validated()['status']);

        return $this->ok(new AdminBookingResource($booking->load('user')), 'Booking status updated.');
    }

    public function assignDriver(AssignDriverRequest $request, Booking $booking)
    {
        $driver = Driver::findOrFail($request->validated()['driverId']);
        $booking = $this->bookings->assignDriver($booking, $driver);

        return $this->ok(new AdminBookingResource($booking->load('user')), 'Driver assigned.');
    }
}
