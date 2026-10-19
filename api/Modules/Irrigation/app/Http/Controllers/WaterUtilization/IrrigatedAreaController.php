<?php

namespace Modules\Irrigation\Http\Controllers\WaterUtilization;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\WaterUtilization\IrrigatedArea\StoreIrrigatedAreaRequest;
use Modules\Irrigation\Http\Requests\WaterUtilization\IrrigatedArea\UpdateIrrigatedAreaRequest;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Services\WaterUtilization\IrrigatedAreaService;

/**
 * Endpoints of water-utilization/irrigated-area (Irrigated land utilization record records).
 */
class IrrigatedAreaController extends IrrigationRecordController
{
    public function __construct(private readonly IrrigatedAreaService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreIrrigatedAreaRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateIrrigatedAreaRequest $request, int $id): JsonResponse
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
