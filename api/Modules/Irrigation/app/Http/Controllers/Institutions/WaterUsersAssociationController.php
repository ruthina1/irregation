<?php

namespace Modules\Irrigation\Http\Controllers\Institutions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Irrigation\Http\Controllers\IrrigationRecordController;
use Modules\Irrigation\Http\Requests\Institutions\WaterUsersAssociation\StoreWaterUsersAssociationRequest;
use Modules\Irrigation\Http\Requests\Institutions\WaterUsersAssociation\UpdateWaterUsersAssociationRequest;
use Modules\Irrigation\Services\Institutions\WaterUsersAssociationService;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Endpoints of institutions/water-users-associations (Water users' association records).
 */
class WaterUsersAssociationController extends IrrigationRecordController
{
    public function __construct(private readonly WaterUsersAssociationService $records) {}

    protected function service(): IrrigationRecordService
    {
        return $this->records;
    }

    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }


    public function store(StoreWaterUsersAssociationRequest $request): JsonResponse
    {
        return $this->storeRecord($request);
    }

    public function show(int $id): JsonResponse
    {
        return parent::show($id);
    }


    public function update(UpdateWaterUsersAssociationRequest $request, int $id): JsonResponse
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
