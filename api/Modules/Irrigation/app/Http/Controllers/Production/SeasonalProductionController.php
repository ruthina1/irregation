<?php

namespace Modules\Irrigation\Http\Controllers\Production;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\Production\SeasonalProduction\StoreSeasonalProductionRequest;
use Modules\Irrigation\Http\Requests\Production\SeasonalProduction\UpdateSeasonalProductionRequest;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Services\Production\SeasonalProductionService;

/**
 * Endpoints of production/seasonal-production (Seasonal crop production record records).
 */
class SeasonalProductionController extends IrrigationRecordController
{
    public function __construct(private readonly SeasonalProductionService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreSeasonalProductionRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateSeasonalProductionRequest $request, int $id): JsonResponse
    {
        return $this->updateRecord($request, $id);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        return parent::destroy($request, $id);
    }

    public function delete(Request $request, int $id): JsonResponse
    {
        return $this->destroy($request, $id);
    }

}
