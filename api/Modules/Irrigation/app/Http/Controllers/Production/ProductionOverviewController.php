<?php

namespace Modules\Irrigation\Http\Controllers\Production;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Irrigation\Services\Production\ProductionOverviewService;
use Modules\Irrigation\Support\IrrigationListFilters;

/**
 * Crop production overview endpoint (GET production/overview).
 */
class ProductionOverviewController extends Controller
{
    public function __construct(private readonly ProductionOverviewService $overview) {}

    public function __invoke(Request $request): JsonResponse
    {
        return response()->json($this->overview->build($request->validate(IrrigationListFilters::rules())['fiscal_year'] ?? null));
    }
}
