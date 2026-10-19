<?php

namespace Modules\Irrigation\Services\Production;

use Modules\Irrigation\Models\Production\HighlandWheatCluster;
use Modules\Irrigation\Models\Production\SeasonalProduction;
use Modules\Irrigation\Services\Reports\IrrigationReport;
use Modules\Irrigation\Support\IrrigationEnums;
use Modules\Irrigation\Support\Production\SeasonalProductionEnums;

/**
 * Crop production overview: seasonal and wheat harvests in one list, with
 * summary KPIs and breakdowns by cropping round and crop category.
 */
class ProductionOverviewService extends IrrigationReport
{
    public function build(?string $fiscalYear): array
    {
        $seasonal = $this->rows(SeasonalProduction::class, $fiscalYear);
        $wheat = $this->rows(HighlandWheatCluster::class, $fiscalYear);

        $location = fn (array $r) => ['zone' => $r['zone'], 'woreda' => $r['woreda'], 'kebele' => $r['kebele']];
        $rows = $seasonal->map(fn ($r) => [
            'key' => 'prd-'.$r['id'],
            'source' => 'seasonal-production',
            'scheme_code' => $r['scheme_code'] ?? null,
            'scheme' => $r['scheme_name'],
            'crop' => $r['specific_crop'],
            'category' => $r['crop_category'],
            'round' => $r['cropping_round'],
            'area_ha' => (float) ($r['cultivated_area_ha'] ?? 0),
            'yield_qt' => (float) ($r['production_yield_quintals'] ?? 0),
            'productivity' => sprintf('%.1f Qt/Ha', $r['productivity_qt_per_ha'] ?? 0),
            'farmers_male' => (int) ($r['farmers_male'] ?? 0),
            'farmers_female' => (int) ($r['farmers_female'] ?? 0),
            'date' => $r['survey_ethiopian_date'] ?? null,
            'status' => $r['harvest_status'],
        ] + $location($r))->concat($wheat->map(fn ($r) => [
            'key' => 'wht-'.$r['id'],
            'source' => 'highland-wheat',
            'scheme_code' => $r['scheme_code'] ?? null,
            'scheme' => $r['scheme_name'],
            'crop' => 'Highland Irrigated Wheat — '.$r['wheat_variety'],
            'category' => 'Cereals (አዝርዕት)',
            'round' => $r['cropping_round'],
            'area_ha' => (float) ($r['wheat_command_ha'] ?? 0),
            'yield_qt' => (float) ($r['expected_yield_qt'] ?? 0),
            'productivity' => sprintf('%.1f Qt/Ha', $r['productivity_qt_ha'] ?? 0),
            'farmers_male' => (int) ($r['farmers_male'] ?? 0),
            'farmers_female' => (int) ($r['farmers_female'] ?? 0),
            'date' => $r['field_survey_eth_date'] ?? null,
            'status' => $r['verification_status'],
        ] + $location($r)))->values();

        $completed = $seasonal->filter(fn ($r) => $r['harvest_status'] === 'Harvest Completed & Weighed')->count()
            + $wheat->filter(fn ($r) => $r['verification_status'] === 'Harvest Weighed & Warehoused')->count();
        $male = (int) self::sum($rows, 'farmers_male');
        $female = (int) self::sum($rows, 'farmers_female');

        return [
            'data' => $rows->all(),
            'summary' => [
                'totalYieldQuintals' => self::sum($rows, 'yield_qt'),
                'wheatHarvestQuintals' => self::sum($wheat, 'expected_yield_qt'),
                'totalCultivatedHa' => self::sum($rows, 'area_ha'),
                'totalFarmers' => $male + $female,
                'totalFemaleFarmers' => $female,
                'harvestCompletionPct' => self::pct($completed, $rows->count()),
            ],
            'rounds' => collect(IrrigationEnums::CROPPING_ROUNDS)->map(function ($round) use ($rows) {
                $inRound = $rows->where('round', $round);

                return ['round' => $round, 'yieldQt' => self::sum($inRound, 'yield_qt'), 'areaHa' => self::sum($inRound, 'area_ha')];
            })->values()->all(),
            'categories' => collect(SeasonalProductionEnums::CROP_CATEGORIES)
                ->map(fn ($c) => ['name' => $c, 'value' => self::sum($rows->where('category', $c), 'yield_qt')])
                ->values()->all(),
        ];
    }
}
