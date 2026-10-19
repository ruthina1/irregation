<?php

namespace Modules\Irrigation\Http\Controllers\StudyDesign;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Irrigation\Http\Requests\StudyDesign\PipelineProject\ScreenPipelineProjectRequest;
use Modules\Irrigation\Models\StudyDesign\PipelineProject;
use Modules\Irrigation\Services\StudyDesign\PipelineProjectService;

class PipelineScreeningController extends Controller
{
    public function __construct(private readonly PipelineProjectService $records) {}

    public function processScreening(ScreenPipelineProjectRequest $request, $id): JsonResponse
    {
        /** @var PipelineProject $record */
        $record = PipelineProject::findOrFail($id);

        try {
            $updated = $this->records->screen($record, $request->validated(), $request->user());
            return $this->successResponse($this->records->present($updated), 'Successfully processed screening.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
