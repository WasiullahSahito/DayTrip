<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\QuickBookingRequest;
use App\Http\Resources\QuickBookingResource;
use App\Models\QuickBooking;
use App\Models\VehicleType;
use Illuminate\Http\Request;

class QuickBookingController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $items = $request->user()->quickBookings()->with('vehicleType')->get();

        return $this->ok(QuickBookingResource::collection($items));
    }

    public function store(QuickBookingRequest $request)
    {
        $data = $request->validated();
        $vehicleType = VehicleType::where('key', $data['vehicleTypeId'])->firstOrFail();

        $request->user()->quickBookings()->create([
            'vehicle_type_id' => $vehicleType->id,
            'label' => $data['label'],
            'pickup' => $data['pickup'],
            'destination' => $data['destination'],
        ]);

        $items = $request->user()->quickBookings()->with('vehicleType')->get();

        return $this->created(QuickBookingResource::collection($items), 'Quick booking saved.');
    }

    public function destroy(Request $request, QuickBooking $quickBooking)
    {
        $this->authorize('delete', $quickBooking);
        $quickBooking->delete();

        $items = $request->user()->quickBookings()->with('vehicleType')->get();

        return $this->ok(QuickBookingResource::collection($items), 'Quick booking deleted.');
    }
}
