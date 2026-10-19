<?php

namespace Modules\Irrigation\Support\WaterUtilization;

use Modules\Irrigation\Support\IrrigationDefinition;
use Modules\Irrigation\Support\IrrigationEnums;

/**
 * Fields and validation of water-utilization/irrigated-area records (irrigation_irrigated_areas).
 */
class IrrigatedAreaDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Irrigated land utilization record',
            'code' => 'utilization_code',
            'status' => ['field' => 'water_adequacy_status', 'values' => IrrigatedAreaEnums::WATER_ADEQUACY_STATUSES, 'default' => 'Optimal Water Supply'],
            'dates' => ['reporting_ethiopian_date' => 'eth_'],
            'fields' => [
                'utilization_code' => self::str(true, 50),
                'scheme_name' => self::str(),
                'scheme_code' => self::str(true, 50),
                'cropping_round' => self::in(IrrigationEnums::CROPPING_ROUNDS),
                'fiscal_year' => self::fiscalYear(),
                'wua_name' => self::str(),
                'land_modality' => self::in(IrrigatedAreaEnums::LAND_MODALITIES),
                'expansion_method' => self::in(IrrigatedAreaEnums::EXPANSION_METHODS),
                'planned_command_ha' => self::num(),
                'actual_irrigated_ha' => self::num(),
                'expansion_area_ha' => self::num(false),
                'farmers_male' => self::int(),
                'farmers_female' => self::int(),
                'dominant_crops' => self::str(true, 500),
                'verifying_expert' => self::str(),
                'field_observations' => self::text(),
            ],
            'computed' => [
                'total_effective_irrigated_ha' => 'float', 'utilization_rate_pct' => 'float', 'total_farmers' => 'int',
            ],
        ];
    }
}
