<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\BookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\VehicleType;
use App\Services\BookingService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    use ApiResponses;

    public function __construct(private BookingService $bookings) {}

    /**
     * ?status=active|history — active is anything not completed/cancelled,
     * history is everything else. Always scoped to the authenticated user;
     * there is no code path here that can return another user's bookings.
     */
    public function index(Request $request)
    {
        $query = $request->user()->bookings()->with('vehicleType')->latest();

        if ($request->query('status') === 'active') {
            $query->whereNotIn('status', ['completed', 'cancelled']);
        } elseif ($request->query('status') === 'history') {
            $query->whereIn('status', ['completed', 'cancelled']);
        }

        $bookings = $query->paginate(min((int) $request->query('per_page', 15), 50));

        // Built explicitly rather than returning the paginator/resource
        // collection as-is — nesting one inside this controller's own
        // {success,message,data} envelope bypasses Laravel's automatic
        // pagination-meta wrapping (that only applies via ->toResponse()),
        // so the shape would otherwise be ambiguous to API consumers.
        return $this->ok([
            'data' => BookingResource::collection($bookings->items()),
            'meta' => [
                'currentPage' => $bookings->currentPage(),
                'lastPage' => $bookings->lastPage(),
                'perPage' => $bookings->perPage(),
                'total' => $bookings->total(),
            ],
        ]);
    }

    /**
     * An Idempotency-Key header (uuid recommended) protects against
     * double-submission from a slow network retry or a double click — a
     * second request with the same key returns the original booking
     * instead of creating a duplicate.
     */
    public function store(BookingRequest $request)
    {
        $data = $request->validated();
        $idempotencyKey = $request->header('Idempotency-Key');

        if ($idempotencyKey) {
            $existing = Booking::where('user_id', $request->user()->id)
                ->where('idempotency_key', $idempotencyKey)
                ->with('vehicleType')
                ->first();

            if ($existing) {
                return $this->created(new BookingResource($existing), 'Booking confirmed!');
            }

            $data['idempotencyKey'] = $idempotencyKey;
        }

        $vehicleType = VehicleType::where('key', $data['vehicleTypeId'])->where('is_active', true)->firstOrFail();

        $booking = $this->bookings->create($request->user(), $vehicleType, $data);

        return $this->created(new BookingResource($booking), 'Booking confirmed!');
    }

    public function show(Request $request, Booking $booking)
    {
        $this->authorize('view', $booking);

        return $this->ok(new BookingResource($booking->load('vehicleType')));
    }

    public function cancel(Request $request, Booking $booking)
    {
        $this->authorize('cancel', $booking);

        $booking = $this->bookings->cancel($booking);

        return $this->ok(new BookingResource($booking), 'Your booking has been cancelled.');
    }
}
