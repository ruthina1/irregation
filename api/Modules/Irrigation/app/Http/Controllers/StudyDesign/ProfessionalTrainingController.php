<?php

namespace Modules\Irrigation\Http\Controllers\StudyDesign;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\StudyDesign\ProfessionalTraining\StoreProfessionalTrainingRequest;
use Modules\Irrigation\Http\Requests\StudyDesign\ProfessionalTraining\UpdateProfessionalTrainingRequest;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Services\StudyDesign\ProfessionalTrainingService;

/**
 * Endpoints of capacity-building (Professional capacity-building training records).
 */
class ProfessionalTrainingController extends IrrigationRecordController
{
    public function __construct(private readonly ProfessionalTrainingService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreProfessionalTrainingRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateProfessionalTrainingRequest $request, int $id): JsonResponse
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
