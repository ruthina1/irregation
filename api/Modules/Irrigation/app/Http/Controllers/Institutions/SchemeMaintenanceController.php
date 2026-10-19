<?php

namespace Modules\Irrigation\Http\Controllers\Institutions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\Institutions\SchemeMaintenance\StoreSchemeMaintenanceRequest;
use Modules\Irrigation\Http\Requests\Institutions\SchemeMaintenance\UpdateSchemeMaintenanceRequest;
use Modules\Irrigation\Services\Institutions\SchemeMaintenanceService;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Endpoints of institutions/maintenance-cleaning (Scheme maintenance & cleaning activity records).
 */
class SchemeMaintenanceController extends IrrigationRecordController
{
    public function __construct(private readonly SchemeMaintenanceService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreSchemeMaintenanceRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateSchemeMaintenanceRequest $request, int $id): JsonResponse
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
