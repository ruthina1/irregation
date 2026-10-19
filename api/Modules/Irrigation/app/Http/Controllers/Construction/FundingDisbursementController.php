<?php

namespace Modules\Irrigation\Http\Controllers\Construction;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Irrigation\Http\Requests\Construction\FundingAllocation\DisburseFundingAllocationRequest;
use Modules\Irrigation\Models\Construction\FundingAllocation;
use Modules\Irrigation\Services\Construction\FundingAllocationService;

class FundingDisbursementController extends Controller
{
    public function __construct(private readonly FundingAllocationService $records) {}

    public function processDisbursement(DisburseFundingAllocationRequest $request, $id): JsonResponse
    {
        /** @var FundingAllocation $record */
        $record = FundingAllocation::findOrFail($id);

        try {
            $updated = $this->records->disburse($record, $request->validated(), $request->user());
            return $this->successResponse($this->records->present($updated), 'Successfully processed funding disbursement.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
