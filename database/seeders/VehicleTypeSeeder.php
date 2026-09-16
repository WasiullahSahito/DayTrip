<?php

namespace Database\Seeders;

use App\Models\VehicleType;
use Illuminate\Database\Seeder;

class VehicleTypeSeeder extends Seeder
{
    /**
     * Mirrors frontend/src/data/vehicles.js exactly, so fares computed here
     * match what the UI already estimates before the backend confirms them.
     */
    public function run(): void
    {
        $types = [
            ['key' => 'saloon', 'name' => 'Saloon', 'passengers' => 4, 'icon' => 'car', 'caption' => null, 'base_fare' => 3.60, 'per_km' => 1.15, 'per_min' => 0.32, 'min_fare' => 6.50, 'eta_mins' => 4],
            ['key' => 'six-seater', 'name' => 'Regular 6 Seater', 'passengers' => 6, 'icon' => 'users', 'caption' => null, 'base_fare' => 4.80, 'per_km' => 1.55, 'per_min' => 0.40, 'min_fare' => 9.50, 'eta_mins' => 6],
            ['key' => 'seven-seater', 'name' => 'Regular 7 Seater', 'passengers' => 7, 'icon' => 'users', 'caption' => null, 'base_fare' => 5.20, 'per_km' => 1.65, 'per_min' => 0.42, 'min_fare' => 10.50, 'eta_mins' => 7],
            ['key' => 'eight-seater', 'name' => 'Regular 8 Seater', 'passengers' => 8, 'icon' => 'users', 'caption' => null, 'base_fare' => 5.60, 'per_km' => 1.75, 'per_min' => 0.44, 'min_fare' => 11.50, 'eta_mins' => 8],
            ['key' => 'wheelchair', 'name' => 'Wheelchair', 'passengers' => 4, 'icon' => 'accessibility', 'caption' => 'May take longer to find', 'base_fare' => 3.60, 'per_km' => 1.15, 'per_min' => 0.32, 'min_fare' => 6.50, 'eta_mins' => 12],
        ];

        foreach ($types as $type) {
            VehicleType::updateOrCreate(['key' => $type['key']], $type);
        }
    }
}
