<?php

namespace Modules\Irrigation\Services\Reports;

use Modules\Irrigation\Models\AgriculturalInputs\InputAllocation;
use Modules\Irrigation\Models\Production\HighlandWheatCluster;
use Modules\Irrigation\Models\Production\SeasonalProduction;

/**
 * Crop production report: harvests, wheat initiative and inputs per zone.
 */
class ProductionReport extends IrrigationReport
{
    public function build(?string $fiscalYear): array
    {
        $seasonal = $this->rows(SeasonalProduction::class, $fiscalYear);
        $wheat = $this->rows(HighlandWheatCluster::class, $fiscalYear);
        $inputs = $this->rows(InputAllocation::class, $fiscalYear);

        $rows = array_map(function ($zone) use ($seasonal, $wheat, $inputs) {
            $s = self::byZone($seasonal, $zone);
            $w = self::byZone($wheat, $zone);
            $i = self::byZone($inputs, $zone);
            $input = fn (string $name, string $unit) => self::sum($i->where('input_name', $name)->where('unit', $unit), 'distributed_qty');

            return [
                'zone' => $zone,
                'cultivated_ha' => self::sum($s, 'cultivated_area_ha'),
                'total_yield_qt' => self::sum($s, 'production_yield_quintals'),
                'wheat_ha' => self::sum($w, 'wheat_command_ha'),
                'wheat_yield_qt' => self::sum($w, 'expected_yield_qt'),
                'farmers_male' => (int) self::sum($s, 'farmers_male'),
                'farmers_female' => (int) self::sum($s, 'farmers_female'),
                'fertilizer_qt' => $input('Fertilizer', 'Quintals'),
                'seed_qt' => $input('Improved Seed', 'Quintals'),
                'compost_m3' => $input('Compost', 'Cubic Meters'),
            ];
        }, self::zones($seasonal, $wheat, $inputs));

        return ['data' => self::withKeys($rows)];
    }
}
