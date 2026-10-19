<?php

namespace Modules\Irrigation\Http\Controllers;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Http\Controllers\Controller;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Support\IrrigationListFilters;

/**
 * Base REST controller for one Irrigation feature.
 *
 * Response contract (consumed by web/src/services/api/irrigationApi.js):
 *  - list:    { data: [...] }  or, with ?per_page, { data: [...], meta: {...} }
 *  - record:  { data: {...} }  (+ message on writes)
 *  - errors:  { message, errors? } with 404 / 409 / 422 / 403 / 401
 */
abstract class IrrigationRecordController extends Controller
{
    abstract protected function service(): IrrigationRecordService;

    public function index(Request $request): JsonResponse
    {
        $result = $this->service()->list($request->validate(IrrigationListFilters::rules()));

        if ($result instanceof LengthAwarePaginator) {
            return response()->json([
                'data' => $this->service()->presentMany($result->getCollection()),
                'meta' => [
                    'current_page' => $result->currentPage(),
                    'per_page' => $result->perPage(),
                    'total' => $result->total(),
                    'last_page' => $result->lastPage(),
                ],
            ]);
        }

        return response()->json(['data' => $this->service()->presentMany($result)]);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => $this->service()->present($this->service()->find($id))]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->service()->delete($this->service()->find($id), $request->user());

        return response()->json(['message' => $this->label().' deleted successfully.']);
    }

    protected function storeRecord(FormRequest $request): JsonResponse
    {
        $record = $this->service()->create($request->validated(), $request->user());

        return response()->json([
            'message' => $this->label().' created successfully.',
            'data' => $this->service()->present($record),
        ], 201);
    }

    protected function updateRecord(FormRequest $request, int $id): JsonResponse
    {
        $record = $this->service()->update($this->service()->find($id), $request->validated(), $request->user());

        return response()->json([
            'message' => $this->label().' updated successfully.',
            'data' => $this->service()->present($record),
        ]);
    }

    protected function actionResponse(IrrigationRecord $record): JsonResponse
    {
        return response()->json([
            'message' => 'Action completed successfully.',
            'data' => $this->service()->present($record),
        ]);
    }

    private function label(): string
    {
        return $this->service()->definition()::label();
    }
}
