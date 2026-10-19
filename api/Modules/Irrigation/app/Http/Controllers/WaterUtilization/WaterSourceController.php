<?php

namespace Modules\Irrigation\Http\Controllers\WaterUtilization;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\WaterUtilization\WaterSource\StoreWaterSourceRequest;
use Modules\Irrigation\Http\Requests\WaterUtilization\WaterSource\UpdateWaterSourceRequest;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Services\WaterUtilization\WaterSourceService;

/**
 * Endpoints of water-utilization/water-sources (Water source & irrigation technology records).
 */
class WaterSourceController extends IrrigationRecordController
{
    public function __construct(private readonly WaterSourceService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreWaterSourceRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateWaterSourceRequest $request, int $id): JsonResponse
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
