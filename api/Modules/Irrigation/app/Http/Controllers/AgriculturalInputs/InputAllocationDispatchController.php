<?php

namespace Modules\Irrigation\Http\Controllers\AgriculturalInputs;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Irrigation\Http\Requests\AgriculturalInputs\InputAllocation\DispatchInputAllocationRequest;
use Modules\Irrigation\Models\AgriculturalInputs\InputAllocation;
use Modules\Irrigation\Services\AgriculturalInputs\InputAllocationService;

class InputAllocationDispatchController extends Controller
{
    public function __construct(private readonly InputAllocationService $records) {}

    public function processDispatch(DispatchInputAllocationRequest $request, $id): JsonResponse
    {
        /** @var InputAllocation $record */
        $record = InputAllocation::findOrFail($id);

        try {
            $updated = $this->records->dispatch($record, $request->validated(), $request->user());
            return $this->successResponse($this->records->present($updated), 'Successfully processed input dispatch.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
