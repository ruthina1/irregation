<?php

namespace Modules\Irrigation\Http\Controllers\StudyDesign;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\StudyDesign\ConstructionReadyDesign\HandOverConstructionReadyDesignRequest;
use Modules\Irrigation\Http\Requests\StudyDesign\ConstructionReadyDesign\UpdateConstructionReadyDesignRequest;
use Modules\Irrigation\Models\StudyDesign\ConstructionReadyDesign;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Services\StudyDesign\ConstructionReadyDesignService;

/**
 * Endpoints of construction-ready (Construction-ready design records).
 */
class ConstructionReadyDesignController extends IrrigationRecordController
{
    public function __construct(private readonly ConstructionReadyDesignService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


        public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }

    public function update(UpdateConstructionReadyDesignRequest $request, int $id): JsonResponse
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


    /** Hand the design over for procurement (POST construction-ready/{id}/handover). */
    public function handover(HandOverConstructionReadyDesignRequest $request, int $id): JsonResponse
    {
        /** @var ConstructionReadyDesign $record */
        $record = $this->records->find($id);

        return $this->actionResponse($this->records->handover($record, $request->validated(), $request->user()));
    }
}
