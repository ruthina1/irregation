<?php

namespace Modules\Irrigation\Support\Production;

use Modules\Irrigation\Support\IrrigationDefinition;
use Modules\Irrigation\Support\IrrigationEnums;

/**
 * Fields and validation of production/highland-wheat records (irrigation_highland_wheat_clusters).
 */
class HighlandWheatClusterDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Highland irrigated wheat cluster',
            'code' => 'initiative_code',
            'status' => ['field' => 'verification_status', 'values' => HighlandWheatClusterEnums::STATUSES, 'default' => 'Harvest Weighed & Warehoused'],
            'dates' => ['field_survey_eth_date' => 'eth_'],
            'fields' => [
                'initiative_code' => self::str(true, 50),
                'scheme_name' => self::str(),
                'scheme_code' => self::str(false, 50),
                'wua_name' => self::str(false),
                'cropping_round' => self::in(IrrigationEnums::CROPPING_ROUNDS),
                'fiscal_year' => self::fiscalYear(),
                'wheat_variety' => self::in(HighlandWheatClusterEnums::VARIETIES),
                'cluster_block_code' => self::str(true, 100),
                'wheat_command_ha' => self::num(true, 0.1),
                'expected_yield_qt' => self::num(),
                'farmers_male' => self::int(),
                'farmers_female' => self::int(),
                'mechanized_harvesting' => self::bool(),
                'lead_agronomist' => self::str(),
                'initiative_notes' => self::text(),
            ],
            'computed' => ['productivity_qt_ha' => 'float', 'total_farmers' => 'int'],
        ];
    }
}
