<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDriverRequest;
use App\Http\Requests\Admin\UpdateDriverRequest;
use App\Http\Resources\DriverResource;
use App\Models\Driver;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $drivers = Driver::orderBy('name')->paginate(min((int) $request->query('per_page', 20), 50));

        return $this->ok([
            'data' => DriverResource::collection($drivers->items()),
            'meta' => [
                'currentPage' => $drivers->currentPage(),
                'lastPage' => $drivers->lastPage(),
                'perPage' => $drivers->perPage(),
                'total' => $drivers->total(),
            ],
        ]);
    }

    public function store(StoreDriverRequest $request)
    {
        $driver = Driver::create($request->validated());

        return $this->created(new DriverResource($driver), 'Driver added.');
    }

    public function update(UpdateDriverRequest $request, Driver $driver)
    {
        $driver->update($request->validated());

        return $this->ok(new DriverResource($driver), 'Driver updated.');
    }

    public function destroy(Driver $driver)
    {
        $driver->delete(); // driver_id on any past bookings is nulled by the FK; driver_snapshot is untouched

        return $this->ok(null, 'Driver removed.');
    }
}
