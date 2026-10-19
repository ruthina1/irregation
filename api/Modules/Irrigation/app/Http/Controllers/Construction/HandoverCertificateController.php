<?php

namespace Modules\Irrigation\Http\Controllers\Construction;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\Construction\HandoverCertificate\StoreHandoverCertificateRequest;
use Modules\Irrigation\Http\Requests\Construction\HandoverCertificate\UpdateHandoverCertificateRequest;
use Modules\Irrigation\Services\Construction\HandoverCertificateService;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Endpoints of construction/completion (Project completion & handover certificate records).
 */
class HandoverCertificateController extends IrrigationRecordController
{
    public function __construct(private readonly HandoverCertificateService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreHandoverCertificateRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateHandoverCertificateRequest $request, int $id): JsonResponse
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
