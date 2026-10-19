<?php

namespace Modules\Irrigation\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

/**
 * Boots the Irrigation module: migrations and API routes.
 */
class IrrigationServiceProvider extends ServiceProvider
{
    /** Permission required for every Irrigation endpoint (same as the Irrigation pages). */
    public const PERMISSION = 'manage-watersheds';

    public function boot(): void
    {
        $this->loadMigrationsFrom(dirname(__DIR__).'/database/migrations');

        if (! $this->app->routesAreCached()) {
            Route::middleware('api')
                ->prefix('api/v1/irrigation')
                ->name('irrigation.')
                ->group(dirname(__DIR__).'/routes/api.php');
        }
    }
}
