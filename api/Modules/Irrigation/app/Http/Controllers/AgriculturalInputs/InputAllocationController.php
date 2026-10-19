<?php

namespace Modules\Irrigation\Http\Controllers\AgriculturalInputs;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\AgriculturalInputs\InputAllocation\DispatchInputAllocationRequest;
use Modules\Irrigation\Http\Requests\AgriculturalInputs\InputAllocation\StoreInputAllocationRequest;
use Modules\Irrigation\Http\Requests\AgriculturalInputs\InputAllocation\UpdateInputAllocationRequest;
use Modules\Irrigation\Models\AgriculturalInputs\InputAllocation;
use Modules\Irrigation\Services\AgriculturalInputs\InputAllocationService;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Endpoints of inputs (Agricultural input allocation records).
 */
class InputAllocationController extends IrrigationRecordController
{
    public function __construct(private readonly InputAllocationService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreInputAllocationRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateInputAllocationRequest $request, int $id): JsonResponse
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


    /** Record a dispatch (POST inputs/{id}/dispatch). */
    public function dispatch(DispatchInputAllocationRequest $request, int $id): JsonResponse
    {
        /** @var InputAllocation $record */
        $record = $this->records->find($id);

        return $this->actionResponse($this->records->dispatch($record, $request->validated(), $request->user()));
    }
}
