<?php

namespace Modules\Irrigation\Http\Controllers\Institutions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\Institutions\AssociationAudit\UpdateAssociationAuditRequest;
use Modules\Irrigation\Services\Institutions\AssociationAuditService;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Endpoints of institutions/assessment-audit (WUA strengthening audit records).
 */
class AssociationAuditController extends IrrigationRecordController
{
    public function __construct(private readonly AssociationAuditService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


        public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }

    public function update(UpdateAssociationAuditRequest $request, int $id): JsonResponse
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
