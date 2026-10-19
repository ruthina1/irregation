<?php

namespace Modules\Irrigation\Http\Controllers\StudyDesign;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Irrigation\Http\Requests\StudyDesign\StudyDesignProject\ReviewStudyDesignProjectRequest;
use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;
use Modules\Irrigation\Services\StudyDesign\StudyDesignProjectService;

class StudyDesignReviewQaController extends Controller
{
    public function __construct(private readonly StudyDesignProjectService $records) {}

    public function processReviewQa(ReviewStudyDesignProjectRequest $request, $id): JsonResponse
    {
        /** @var StudyDesignProject $record */
        $record = StudyDesignProject::findOrFail($id);

        try {
            $updated = $this->records->reviewQa($record, $request->validated(), $request->user());
            return $this->successResponse($this->records->present($updated), 'Successfully processed study design review and QA.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
