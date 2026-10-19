<?php

namespace Modules\Irrigation\Http\Controllers\Reports;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Irrigation\Services\Reports\BeneficiariesReport;
use Modules\Irrigation\Services\Reports\ConstructionReport;
use Modules\Irrigation\Services\Reports\DirectorateMasterReport;
use Modules\Irrigation\Services\Reports\InstitutionsReport;
use Modules\Irrigation\Services\Reports\IrrigationReport;
use Modules\Irrigation\Services\Reports\ProductionReport;
use Modules\Irrigation\Services\Reports\StudyDesignReport;
use Modules\Irrigation\Services\Reports\WaterUtilizationReport;
use Modules\Irrigation\Support\IrrigationListFilters;

/**
 * Analytics & Reports endpoints (GET reports/{report}).
 */
class IrrigationReportController extends Controller
{
    /** @var array<string, class-string<IrrigationReport>> */
    public const REPORTS = [
        'directorate-master' => DirectorateMasterReport::class,
        'study-design' => StudyDesignReport::class,
        'construction' => ConstructionReport::class,
        'institutions' => InstitutionsReport::class,
        'water-utilization' => WaterUtilizationReport::class,
        'production' => ProductionReport::class,
        'beneficiaries' => BeneficiariesReport::class,
    ];

    public function show(Request $request, string $report): JsonResponse
    {
        $fiscalYear = $request->validate(IrrigationListFilters::rules())['fiscal_year'] ?? null;

        return response()->json(app(self::REPORTS[$report])->build($fiscalYear));
    }
}
