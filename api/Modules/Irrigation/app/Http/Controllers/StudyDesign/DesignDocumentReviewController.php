<?php

namespace Modules\Irrigation\Http\Controllers\StudyDesign;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\StudyDesign\DesignDocumentReview\StoreDesignDocumentReviewRequest;
use Modules\Irrigation\Http\Requests\StudyDesign\DesignDocumentReview\UpdateDesignDocumentReviewRequest;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Services\StudyDesign\DesignDocumentReviewService;

/**
 * Endpoints of document-review (Design document review records).
 */
class DesignDocumentReviewController extends IrrigationRecordController
{
    public function __construct(private readonly DesignDocumentReviewService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreDesignDocumentReviewRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateDesignDocumentReviewRequest $request, int $id): JsonResponse
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

}
