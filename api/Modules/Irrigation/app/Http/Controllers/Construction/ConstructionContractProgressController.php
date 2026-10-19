<?php

namespace Modules\Irrigation\Http\Controllers\Construction;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Irrigation\Http\Requests\Construction\ConstructionContract\EvaluateConstructionContractProgressRequest;
use Modules\Irrigation\Models\Construction\ConstructionContract;
use Modules\Irrigation\Services\Construction\ConstructionContractService;

class ConstructionContractProgressController extends Controller
{
    public function __construct(private readonly ConstructionContractService $records) {}

    public function processProgress(EvaluateConstructionContractProgressRequest $request, $id): JsonResponse
    {
        /** @var ConstructionContract $record */
        $record = ConstructionContract::findOrFail($id);

        try {
            $updated = $this->records->evaluateProgress($record, $request->validated(), $request->user());
            return $this->successResponse($this->records->present($updated), 'Successfully updated construction contract progress.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
