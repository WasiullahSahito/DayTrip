<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVehicleTypeRequest;
use App\Http\Requests\Admin\UpdateVehicleTypeRequest;
use App\Http\Resources\Admin\AdminVehicleTypeResource;
use App\Models\VehicleType;

class VehicleTypeController extends Controller
{
    use ApiResponses;

    /**
     * Includes inactive types too (unlike the public
     * Api\VehicleTypeController::index) — the admin needs to see and
     * re-enable a deactivated type, not just the ones customers can book.
     */
    public function index()
    {
        $types = VehicleType::orderBy('id')->get();

        return $this->ok(AdminVehicleTypeResource::collection($types));
    }

    public function store(StoreVehicleTypeRequest $request)
    {
        $vehicleType = VehicleType::create($request->validated());
        // create() doesn't reflect columns the DB defaulted (eta_mins,
        // is_active) when they're omitted from input — reload to get the
        // real stored values rather than nulls.
        $vehicleType->refresh();

        return $this->created(new AdminVehicleTypeResource($vehicleType), 'Vehicle type added.');
    }

    public function update(UpdateVehicleTypeRequest $request, VehicleType $vehicleType)
    {
        $vehicleType->update($request->validated());

        return $this->ok(new AdminVehicleTypeResource($vehicleType), 'Vehicle type updated.');
    }
}
