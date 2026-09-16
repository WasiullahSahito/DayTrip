<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Resources\VehicleTypeResource;
use App\Models\VehicleType;

class VehicleTypeController extends Controller
{
    use ApiResponses;

    public function index()
    {
        $types = VehicleType::where('is_active', true)->orderBy('id')->get();

        return $this->ok(VehicleTypeResource::collection($types));
    }
}
