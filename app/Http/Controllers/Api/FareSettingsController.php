<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Services\FareSettings;

class FareSettingsController extends Controller
{
    use ApiResponses;

    /**
     * Public — the estimator and booking form use these rates for live
     * previews. The server still recomputes the real fare on every booking.
     */
    public function show(FareSettings $settings)
    {
        return $this->ok($settings->toResponse());
    }
}
