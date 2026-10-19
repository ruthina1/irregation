<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Application API routes   (prefix: /api/v1)
|--------------------------------------------------------------------------
| Module routes (e.g. /api/v1/irrigation/*) are registered by each module's
| service provider under Modules/.
*/

use App\Http\Controllers\LocationController;

Route::prefix('umac')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
    });
});

Route::get('zones', [LocationController::class, 'getZones']);
Route::get('woredas', [LocationController::class, 'getWoredas']);
Route::get('kebeles', [LocationController::class, 'getKebeles']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('zones', [LocationController::class, 'createZone']);
    Route::put('zones/{id}', [LocationController::class, 'updateZone']);
    Route::delete('zones/{id}', [LocationController::class, 'deleteZone']);

    Route::post('woredas', [LocationController::class, 'createWoreda']);
    Route::put('woredas/{id}', [LocationController::class, 'updateWoreda']);
    Route::delete('woredas/{id}', [LocationController::class, 'deleteWoreda']);

    Route::post('kebeles', [LocationController::class, 'createKebele']);
    Route::put('kebeles/{id}', [LocationController::class, 'updateKebele']);
    Route::delete('kebeles/{id}', [LocationController::class, 'deleteKebele']);
});

