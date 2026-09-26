<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateFareSettingsRequest;
use App\Services\FareSettings;

class FareSettingsController extends Controller
{
    use ApiResponses;

    public function show(FareSettings $settings)
    {
        return $this->ok($settings->toResponse());
    }

    public function update(UpdateFareSettingsRequest $request, FareSettings $settings)
    {
        $settings->update($request->validated());

        return $this->ok($settings->toResponse(), 'Fare settings updated.');
    }
}
