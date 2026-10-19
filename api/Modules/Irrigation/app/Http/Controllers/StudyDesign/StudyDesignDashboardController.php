<?php

namespace Modules\Irrigation\Http\Controllers\StudyDesign;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Irrigation\Services\StudyDesign\StudyDesignDashboardService;
use Modules\Irrigation\Support\IrrigationListFilters;

/**
 * Study & Design dashboard endpoint (GET study-design/dashboard).
 */
class StudyDesignDashboardController extends Controller
{
    public function __construct(private readonly StudyDesignDashboardService $dashboard) {}

    public function __invoke(Request $request): JsonResponse
    {
        return response()->json($this->dashboard->build($request->validate(IrrigationListFilters::rules())['fiscal_year'] ?? null));
    }
}
