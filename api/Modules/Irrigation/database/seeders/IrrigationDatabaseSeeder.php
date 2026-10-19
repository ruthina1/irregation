<?php

namespace Modules\Irrigation\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Irrigation\Providers\IrrigationServiceProvider;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Access control for the Irrigation module. Creates no business records.
 */
class IrrigationDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permission = Permission::findOrCreate(IrrigationServiceProvider::PERMISSION, 'web');

        Role::findOrCreate('Irrigation Officer', 'web')->givePermissionTo($permission);

        $this->call([
            IrrigationSampleDataSeeder::class,
        ]);
    }
}
