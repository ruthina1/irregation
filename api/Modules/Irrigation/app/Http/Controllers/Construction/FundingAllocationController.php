<?php

namespace Modules\Irrigation\Http\Controllers\Construction;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\Construction\FundingAllocation\DisburseFundingAllocationRequest;
use Modules\Irrigation\Http\Requests\Construction\FundingAllocation\StoreFundingAllocationRequest;
use Modules\Irrigation\Http\Requests\Construction\FundingAllocation\UpdateFundingAllocationRequest;
use Modules\Irrigation\Models\Construction\FundingAllocation;
use Modules\Irrigation\Services\Construction\FundingAllocationService;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Endpoints of construction/funding (Funding allocation records).
 */
class FundingAllocationController extends IrrigationRecordController
{
    public function __construct(private readonly FundingAllocationService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreFundingAllocationRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateFundingAllocationRequest $request, int $id): JsonResponse
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


    /** Record a disbursement (POST construction/funding/{id}/disburse). */
    public function disburse(DisburseFundingAllocationRequest $request, int $id): JsonResponse
    {
        /** @var FundingAllocation $record */
        $record = $this->records->find($id);

        return $this->actionResponse($this->records->disburse($record, $request->validated(), $request->user()));
    }
}
