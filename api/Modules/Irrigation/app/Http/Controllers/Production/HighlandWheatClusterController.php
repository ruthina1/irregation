<?php

namespace Modules\Irrigation\Http\Controllers\Production;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\Production\HighlandWheatCluster\StoreHighlandWheatClusterRequest;
use Modules\Irrigation\Http\Requests\Production\HighlandWheatCluster\UpdateHighlandWheatClusterRequest;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Services\Production\HighlandWheatClusterService;

/**
 * Endpoints of production/highland-wheat (Highland irrigated wheat cluster records).
 */
class HighlandWheatClusterController extends IrrigationRecordController
{
    public function __construct(private readonly HighlandWheatClusterService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreHighlandWheatClusterRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateHighlandWheatClusterRequest $request, int $id): JsonResponse
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
