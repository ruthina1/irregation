<?php

namespace Modules\Irrigation\Http\Controllers\Construction;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\Construction\ConstructionContract\EvaluateConstructionContractProgressRequest;
use Modules\Irrigation\Http\Requests\Construction\ConstructionContract\StoreConstructionContractRequest;
use Modules\Irrigation\Http\Requests\Construction\ConstructionContract\UpdateConstructionContractRequest;
use Modules\Irrigation\Models\Construction\ConstructionContract;
use Modules\Irrigation\Services\Construction\ConstructionContractService;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Endpoints of construction/projects (Construction contract records).
 */
class ConstructionContractController extends IrrigationRecordController
{
    public function __construct(private readonly ConstructionContractService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreConstructionContractRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateConstructionContractRequest $request, int $id): JsonResponse
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


    /** Evaluate contract progress (PUT construction/projects/{id}/progress). */
    public function progress(EvaluateConstructionContractProgressRequest $request, int $id): JsonResponse
    {
        /** @var ConstructionContract $record */
        $record = $this->records->find($id);

        return $this->actionResponse($this->records->evaluateProgress($record, $request->validated(), $request->user()));
    }
}
