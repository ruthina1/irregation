<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\Irrigation\Database\Seeders\IrrigationDatabaseSeeder;
use RuntimeException;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed roles/permissions and the initial administrator account.
     *
     * The administrator credentials come from IAIMS_ADMIN_EMAIL /
     * IAIMS_ADMIN_PASSWORD in .env — they are never hard-coded.
     */
    public function run(): void
    {
        $this->call([
            IrrigationDatabaseSeeder::class,
            LocationSeeder::class,
        ]);

        Role::findOrCreate('SuperAdmin', 'web');

        $email = env('IAIMS_ADMIN_EMAIL');
        $password = env('IAIMS_ADMIN_PASSWORD');
        if (! $email || ! $password) {
            throw new RuntimeException('Set IAIMS_ADMIN_EMAIL and IAIMS_ADMIN_PASSWORD in .env before seeding.');
        }

        $admin = User::firstOrCreate(
            ['email' => $email],
            ['name' => env('IAIMS_ADMIN_NAME', 'System Administrator'), 'password' => $password],
        );
        $admin->assignRole('SuperAdmin');
    }
}
