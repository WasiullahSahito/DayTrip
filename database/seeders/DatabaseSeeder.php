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

        // Demo accounts (with a known password, one of them an admin) are for
        // local development only — never create them on a real server. Create
        // the real admin by registering, then setting is_admin (see deploy/DEPLOY.md).
        if (! app()->environment('local', 'testing')) {
            return;
        }

        User::factory()->create([
            'first_name' => 'Aoife',
            'last_name' => 'Murphy',
            'email' => 'demo@lynk.ie',
            'password' => 'password123', // the `hashed` cast on User::password hashes this automatically
            'phone' => '+353871234567',
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
            'email' => 'admin@daytrip.ie',
            'password' => 'password123',
            'phone' => '+353879990000',
            'account_type' => 'personal',
        ]);
        $admin->forceFill(['is_admin' => true])->save();
    }
}
