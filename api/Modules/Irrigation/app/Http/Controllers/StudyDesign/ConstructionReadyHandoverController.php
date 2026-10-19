<?php

namespace Modules\Irrigation\Http\Controllers\StudyDesign;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Irrigation\Http\Requests\StudyDesign\ConstructionReadyDesign\HandOverConstructionReadyDesignRequest;
use Modules\Irrigation\Models\StudyDesign\ConstructionReadyDesign;
use Modules\Irrigation\Services\StudyDesign\ConstructionReadyDesignService;

class ConstructionReadyHandoverController extends Controller
{
    public function __construct(private readonly ConstructionReadyDesignService $records) {}

    public function processHandover(HandOverConstructionReadyDesignRequest $request, $id): JsonResponse
    {
        /** @var ConstructionReadyDesign $record */
        $record = ConstructionReadyDesign::findOrFail($id);

        try {
            $updated = $this->records->handover($record, $request->validated(), $request->user());
            return $this->successResponse($this->records->present($updated), 'Successfully processed construction-ready design handover.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
