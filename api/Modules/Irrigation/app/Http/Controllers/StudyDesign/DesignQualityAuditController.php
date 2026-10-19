<?php

namespace Modules\Irrigation\Http\Controllers\StudyDesign;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\StudyDesign\DesignQualityAudit\StoreDesignQualityAuditRequest;
use Modules\Irrigation\Http\Requests\StudyDesign\DesignQualityAudit\UpdateDesignQualityAuditRequest;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Services\StudyDesign\DesignQualityAuditService;

/**
 * Endpoints of quality-assurance (Design quality-assurance audit records).
 */
class DesignQualityAuditController extends IrrigationRecordController
{
    public function __construct(private readonly DesignQualityAuditService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreDesignQualityAuditRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateDesignQualityAuditRequest $request, int $id): JsonResponse
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
