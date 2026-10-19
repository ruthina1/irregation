<?php

namespace Modules\Irrigation\Http\Controllers\StudyDesign;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\StudyDesign\StudyDesignProject\ReviewStudyDesignProjectRequest;
use Modules\Irrigation\Http\Requests\StudyDesign\StudyDesignProject\StoreStudyDesignProjectRequest;
use Modules\Irrigation\Http\Requests\StudyDesign\StudyDesignProject\UpdateStudyDesignProjectRequest;
use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Services\StudyDesign\StudyDesignProjectService;

/**
 * Endpoints of study-design (Study & design project records).
 */
class StudyDesignProjectController extends IrrigationRecordController
{
    public function __construct(private readonly StudyDesignProjectService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreStudyDesignProjectRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateStudyDesignProjectRequest $request, int $id): JsonResponse
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


    /** Record the review and QA decision (PATCH study-design/{id}/review-qa). */
    public function reviewQa(ReviewStudyDesignProjectRequest $request, int $id): JsonResponse
    {
        /** @var StudyDesignProject $record */
        $record = $this->records->find($id);

        return $this->actionResponse($this->records->reviewQa($record, $request->validated(), $request->user()));
    }
}
