<?php

namespace Database\Seeders;

use App\Models\Driver;
use Illuminate\Database\Seeder;

class DriverSeeder extends Seeder
{
    /**
     * Migrates the fleet that used to live as a hardcoded array in
     * BookingService into real, admin-manageable rows.
     */
    public function run(): void
    {
        $drivers = [
            ['name' => 'Seán Byrne', 'phone' => '+353 87 100 1001', 'rating' => 4.9, 'reg' => '141-D-45231', 'car' => 'Toyota Prius', 'color' => 'Silver', 'is_active' => true],
            ['name' => 'Aisling Kelly', 'phone' => '+353 87 100 1002', 'rating' => 4.8, 'reg' => '192-D-11823', 'car' => 'Skoda Octavia', 'color' => 'Black', 'is_active' => true],
            ['name' => 'Cian O’Sullivan', 'phone' => '+353 87 100 1003', 'rating' => 5.0, 'reg' => '182-D-33012', 'car' => 'Toyota Corolla', 'color' => 'White', 'is_active' => true],
            ['name' => 'Niamh Walsh', 'phone' => '+353 87 100 1004', 'rating' => 4.7, 'reg' => '201-D-77410', 'car' => 'Hyundai Ioniq', 'color' => 'Blue', 'is_active' => true],
            ['name' => 'Darragh Ryan', 'phone' => '+353 87 100 1005', 'rating' => 4.9, 'reg' => '171-D-90042', 'car' => 'Volkswagen Passat', 'color' => 'Grey', 'is_active' => true],
        ];

        foreach ($drivers as $driver) {
            Driver::updateOrCreate(['reg' => $driver['reg']], $driver);
        }
    }
}
