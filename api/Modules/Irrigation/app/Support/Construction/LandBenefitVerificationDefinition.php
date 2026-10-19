<?php

namespace Modules\Irrigation\Support\Construction;

use Modules\Irrigation\Support\IrrigationDefinition;
use Modules\Irrigation\Support\IrrigationEnums;

/**
 * Fields and validation of construction/benefits records (irrigation_land_benefit_verifications).
 */
class LandBenefitVerificationDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Developed land & beneficiaries verification',
            'code' => 'benefit_code',
            'status' => ['field' => 'benefit_status', 'values' => LandBenefitVerificationEnums::STATUSES, 'default' => 'Command Developed (Pre-Watering)'],
            'dates' => ['verification_ethiopian_date' => 'eth_'],
            'fields' => [
                'benefit_code' => self::str(true, 50),
                'scheme_name' => self::str(),
                'contract_code' => self::str(true, 50),
                'project_code' => self::str(false, 50),
                'scheme_type' => self::in(IrrigationEnums::SCHEME_TYPES),
                'funding_source' => self::in(IrrigationEnums::FUNDING_SOURCES),
                'planned_command_ha' => self::num(),
                'actual_developed_ha' => self::num(),
                'operational_cultivated_ha' => self::num(),
                'beneficiaries_male' => self::int(),
                'beneficiaries_female' => self::int(),
                'youth_beneficiaries_count' => self::int(false),
                'primary_crops_cultivated' => ['required', 'array', 'min:1'],
                'primary_crops_cultivated.*' => ['string', 'max:150'],
                'cropping_intensity_ratio' => self::num(true, 1, 3.5),
                'verifying_agronomist' => self::str(),
                'field_survey_remarks' => self::text(),
            ],
            'computed' => ['land_development_rate_pct' => 'float', 'total_beneficiaries' => 'int'],
        ];
    }
}
