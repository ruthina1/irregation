<?php

namespace Modules\Irrigation\Http\Controllers\Construction;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\Construction\LandBenefitVerification\StoreLandBenefitVerificationRequest;
use Modules\Irrigation\Http\Requests\Construction\LandBenefitVerification\UpdateLandBenefitVerificationRequest;
use Modules\Irrigation\Services\Construction\LandBenefitVerificationService;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Endpoints of construction/benefits (Developed land & beneficiaries verification records).
 */
class LandBenefitVerificationController extends IrrigationRecordController
{
    public function __construct(private readonly LandBenefitVerificationService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreLandBenefitVerificationRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateLandBenefitVerificationRequest $request, int $id): JsonResponse
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
