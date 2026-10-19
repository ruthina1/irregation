<?php

namespace Modules\Irrigation\Http\Controllers\StudyDesign;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\StudyDesign\PipelineProject\ScreenPipelineProjectRequest;
use Modules\Irrigation\Http\Requests\StudyDesign\PipelineProject\StorePipelineProjectRequest;
use Modules\Irrigation\Http\Requests\StudyDesign\PipelineProject\UpdatePipelineProjectRequest;
use Modules\Irrigation\Models\StudyDesign\PipelineProject;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Services\StudyDesign\PipelineProjectService;

/**
 * Endpoints of pipeline (Pipeline project records).
 */
class PipelineProjectController extends IrrigationRecordController
{
    public function __construct(private readonly PipelineProjectService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StorePipelineProjectRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdatePipelineProjectRequest $request, int $id): JsonResponse
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


    /** Record a reconnaissance/screening decision (PATCH pipeline/{id}/screening). */
    public function screening(ScreenPipelineProjectRequest $request, int $id): JsonResponse
    {
        /** @var PipelineProject $record */
        $record = $this->records->find($id);

        return $this->actionResponse($this->records->screen($record, $request->validated(), $request->user()));
    }
}
