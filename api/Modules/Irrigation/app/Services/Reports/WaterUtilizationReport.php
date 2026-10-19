<?php

namespace Modules\Irrigation\Services\Reports;

use Modules\Irrigation\Models\WaterUtilization\IrrigatedArea;
use Modules\Irrigation\Models\WaterUtilization\WaterSource;

/**
 * Water utilization report: effective irrigated area and technologies per zone.
 */
class WaterUtilizationReport extends IrrigationReport
{
    public function build(?string $fiscalYear): array
    {
        $areas = $this->rows(IrrigatedArea::class, $fiscalYear);
        $sources = $this->rows(WaterSource::class, $fiscalYear);

        $rows = array_map(function ($zone) use ($areas, $sources) {
            $a = self::byZone($areas, $zone);
            $s = self::byZone($sources, $zone);
            $round = fn ($n) => self::sum($a->filter(fn ($r) => str_starts_with((string) ($r['cropping_round'] ?? ''), "Round {$n}")), 'total_effective_irrigated_ha');
            $tech = fn (array $needles) => $s->filter(function ($r) use ($needles) {
                foreach ($needles as $needle) {
                    if (str_contains((string) ($r['technology_type'] ?? ''), $needle)) {
                        return true;
                    }
                }

                return false;
            });

            return [
                'zone' => $zone,
                'round_1_ha' => $round(1),
                'round_2_ha' => $round(2),
                'round_3_ha' => $round(3),
                'total_effective_ha' => self::sum($a, 'total_effective_irrigated_ha'),
                // Irrigation application methods (drip/sprinkler/furrow) and field
                // application efficiency are not recorded by any Irrigation page.
                'drip_sprinkler_ha' => null,
                'surface_furrow_ha' => null,
                'avg_application_efficiency_pct' => null,
                'solar_pump_sites' => $tech(['Solar', 'ፀሐይ'])->count(),
                'deep_well_sites' => $tech(['Deep', 'ጥልቅ'])->count(),
                'avg_utilization_rate_pct' => self::avg($a, 'utilization_rate_pct'),
            ];
        }, self::zones($areas, $sources));

        return [
            'data' => self::withKeys($rows),
            'meta' => ['untracked_metrics' => ['drip_sprinkler_ha', 'surface_furrow_ha', 'avg_application_efficiency_pct']],
        ];
    }
}
