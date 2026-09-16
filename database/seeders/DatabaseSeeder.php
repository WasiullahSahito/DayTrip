<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(VehicleTypeSeeder::class);
        $this->call(DriverSeeder::class);

        User::factory()->create([
            'first_name' => 'Aoife',
            'last_name' => 'Murphy',
            'email' => 'demo@lynk.ie',
            'password' => 'password123', // the `hashed` cast on User::password hashes this automatically
            'phone' => '+353 87 123 4567',
            'account_type' => 'personal',
        ]);

        // is_admin is deliberately excluded from User's #[Fillable] attribute
        // so it can never be mass-assigned from a request — factory create()
        // goes through fill() too, so it'd silently drop an 'is_admin' key
        // here as well. forceFill() is required to seed it (same technique
        // AuthController::resetPassword already uses for the password field).
        $admin = User::factory()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@lynk.ie',
            'password' => 'password123',
            'phone' => '+353 87 999 0000',
            'account_type' => 'personal',
        ]);
        $admin->forceFill(['is_admin' => true])->save();
    }
}
