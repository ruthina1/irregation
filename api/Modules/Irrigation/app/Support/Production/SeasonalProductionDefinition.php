<?php

namespace Modules\Irrigation\Support\Production;

use Modules\Irrigation\Support\IrrigationDefinition;
use Modules\Irrigation\Support\IrrigationEnums;

/**
 * Fields and validation of production/seasonal-production records (irrigation_seasonal_productions).
 */
class SeasonalProductionDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Seasonal crop production record',
            'code' => 'production_code',
            'status' => ['field' => 'harvest_status', 'values' => SeasonalProductionEnums::STATUSES, 'default' => 'Harvest Completed & Weighed'],
            'dates' => ['survey_ethiopian_date' => 'eth_'],
            'fields' => [
                'production_code' => self::str(true, 50),
                'scheme_name' => self::str(),
                'scheme_code' => self::str(false, 50),
                'wua_name' => self::str(false),
                'cropping_round' => self::in(IrrigationEnums::CROPPING_ROUNDS),
                'fiscal_year' => self::fiscalYear(),
                'crop_category' => self::in(SeasonalProductionEnums::CROP_CATEGORIES),
                'specific_crop' => self::str(true, 150),
                'cultivated_area_ha' => self::num(true, 0.1),
                'production_yield_quintals' => self::num(),
                'farmers_male' => self::int(),
                'farmers_female' => self::int(),
                'verifying_agronomist' => self::str(),
                'agronomic_remarks' => self::text(),
            ],
            'computed' => ['productivity_qt_per_ha' => 'float', 'total_farmers' => 'int'],
        ];
    }
}
