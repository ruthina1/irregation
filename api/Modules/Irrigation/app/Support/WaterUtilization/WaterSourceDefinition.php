<?php

namespace Modules\Irrigation\Support\WaterUtilization;

use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of water-utilization/water-sources records (irrigation_water_sources).
 */
class WaterSourceDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Water source & irrigation technology',
            'code' => null,
            'status' => ['field' => 'operational_status', 'values' => WaterSourceEnums::STATUSES, 'default' => 'Functional & Operating'],
            'fields' => [
                'scheme_name' => self::str(),
                'wua_name' => self::str(),
                'fiscal_year' => self::fiscalYear(),
                'technology_type' => self::in(WaterSourceEnums::TECHNOLOGIES),
                'equipment_units_count' => self::int(true, 1, 50),
                'discharge_capacity_liters_sec' => self::num(true, 0.1),
                'command_area_served_ha' => self::num(true, 0.1),
                'energy_source' => self::str(),
                'farmers_male' => self::int(),
                'farmers_female' => self::int(),
                'installation_eth_year' => self::fiscalYear(),
                'technical_specs' => self::str(false, 1000),
            ],
            'computed' => ['source_category' => 'string', 'total_farmers' => 'int'],
        ];
    }
}
