<?php

namespace Modules\Irrigation\Services\Reports;

use Illuminate\Support\Collection;
use Modules\Irrigation\Models\Construction\ConstructionContract;
use Modules\Irrigation\Models\Construction\LandBenefitVerification;

/**
 * Construction performance report: progress and budget per funding program.
 */
class ConstructionReport extends IrrigationReport
{
    public function build(?string $fiscalYear): array
    {
        $projects = $this->rows(ConstructionContract::class, $fiscalYear);
        $benefits = $this->rows(LandBenefitVerification::class, $fiscalYear);

        $rows = $projects->groupBy(fn ($p) => $p['funding_source'] ?? 'Unspecified')->map(function (Collection $group, $program) use ($benefits) {
            $new = $group->where('scheme_type', 'New Construction');
            $rehab = $group->where('scheme_type', 'Existing Rehabilitation');
            $contracts = $group->pluck('contract_code')->filter()->all();

            return [
                'program' => $program,
                'new_schemes_count' => $new->count(),
                'existing_rehab_count' => $rehab->count(),
                'avg_new_physical_pct' => self::avg($new, 'physical_progress_pct'),
                'avg_rehab_physical_pct' => self::avg($rehab, 'physical_progress_pct'),
                'allocated_budget_etb' => self::sum($group, 'contract_sum_etb'),
                'disbursed_etb' => self::sum($group, 'disbursed_sum_etb'),
                'developed_land_ha' => self::sum($benefits->whereIn('contract_code', $contracts), 'actual_developed_ha'),
                'beneficiaries_total' => (int) (self::sum($group, 'beneficiaries_male') + self::sum($group, 'beneficiaries_female')),
            ];
        })->sortKeys()->values()->all();

        $onSchedule = $projects->filter(fn ($p) => in_array($p['health_status'] ?? null, ['On Track', 'Ahead of Schedule'], true))->count();

        return [
            'data' => self::withKeys($rows),
            'meta' => ['milestone_adherence_pct' => $projects->isEmpty() ? null : self::pct($onSchedule, $projects->count())],
        ];
    }
}
