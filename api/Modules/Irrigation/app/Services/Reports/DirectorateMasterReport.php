<?php

namespace Modules\Irrigation\Services\Reports;

use Illuminate\Support\Collection;
use Modules\Irrigation\Models\Construction\ConstructionContract;
use Modules\Irrigation\Models\Construction\FundingAllocation;
use Modules\Irrigation\Models\Production\HighlandWheatCluster;
use Modules\Irrigation\Models\Production\SeasonalProduction;
use Modules\Irrigation\Models\StudyDesign\ConstructionReadyDesign;
use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;
use Modules\Irrigation\Models\WaterUtilization\IrrigatedArea;
use Modules\Irrigation\Support\Construction\ConstructionContractEnums;
use Modules\Irrigation\Support\StudyDesign\ConstructionReadyDesignEnums;

/**
 * Directorate master report: one row per zone across every Irrigation pillar,
 * plus the financing-program portfolio.
 */
class DirectorateMasterReport extends IrrigationReport
{
    public function __construct(private readonly InstitutionsReport $institutions) {}

    public function build(?string $fiscalYear): array
    {
        $studies = $this->rows(StudyDesignProject::class, $fiscalYear);
        $shelf = $this->rows(ConstructionReadyDesign::class, $fiscalYear);
        $projects = $this->rows(ConstructionContract::class, $fiscalYear);
        $funding = $this->rows(FundingAllocation::class, $fiscalYear);
        $areas = $this->rows(IrrigatedArea::class, $fiscalYear);
        $seasonal = $this->rows(SeasonalProduction::class, $fiscalYear);
        $wheat = $this->rows(HighlandWheatCluster::class, $fiscalYear);
        $institutions = $this->institutions->zoneRows($fiscalYear);

        $zones = self::zones($studies, $shelf, $projects, $funding, $areas, $seasonal, $wheat, collect(array_values($institutions)));

        $rows = array_map(function ($zone) use ($studies, $shelf, $projects, $funding, $areas, $seasonal, $wheat, $institutions) {
            $p = self::byZone($projects, $zone);
            $active = $p->filter(fn ($r) => ($r['construction_status'] ?? null) !== ConstructionContractEnums::HANDED_OVER);
            $inst = $institutions[$zone] ?? [];
            $male = (int) self::sum($p, 'beneficiaries_male');
            $female = (int) self::sum($p, 'beneficiaries_female');

            return [
                'zone' => $zone,
                'active_studies' => self::byZone($studies, $zone)->filter(fn ($s) => empty($s['is_construction_ready']))->count(),
                'construction_ready_schemes' => self::byZone($shelf, $zone)->whereNotIn('shelf_status', [ConstructionReadyDesignEnums::HANDED_OVER, ConstructionReadyDesignEnums::ARCHIVED])->count(),
                'active_construction_schemes' => $active->count(),
                'avg_physical_progress_pct' => self::avg($active, 'physical_progress_pct') ?? 0,
                'allocated_construction_budget_etb' => self::sum(self::byZone($funding, $zone), 'total_allocated_budget_etb'),
                'disbursed_budget_etb' => self::sum(self::byZone($funding, $zone), 'cumulative_disbursed_etb'),
                'managed_command_ha' => self::sum($p, 'command_area_ha'),
                'irrigated_actual_ha' => self::sum(self::byZone($areas, $zone), 'total_effective_irrigated_ha'),
                'total_yield_quintals' => self::sum(self::byZone($seasonal, $zone), 'production_yield_quintals'),
                'wheat_initiative_yield_qt' => self::sum(self::byZone($wheat, $zone), 'expected_yield_qt'),
                'registered_wuas' => $inst['total_wuas'] ?? 0,
                'audited_wuas' => $inst['audited_wuas'] ?? 0,
                'modern_canal_km' => $inst['modern_canal_maintained_km'] ?? 0,
                'traditional_canal_km' => $inst['traditional_canal_maintained_km'] ?? 0,
                'farmers_male' => $male,
                'farmers_female' => $female,
                'total_farmers' => $male + $female,
            ];
        }, $zones);

        $portfolio = $funding->groupBy(fn ($f) => $f['funding_program'] ?? 'Unspecified')->map(fn (Collection $group, $program) => [
            'program' => $program,
            'allocated' => round(self::sum($group, 'total_allocated_budget_etb') / 1_000_000, 2),
            'disbursed' => round(self::sum($group, 'cumulative_disbursed_etb') / 1_000_000, 2),
            'schemes' => $group->pluck('contract_code')->filter()->unique()->count(),
        ])->sortKeys()->values()->all();

        return ['data' => self::withKeys($rows), 'program_portfolio' => $portfolio];
    }
}
