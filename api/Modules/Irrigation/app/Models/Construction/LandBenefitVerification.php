<?php

namespace Modules\Irrigation\Models\Construction;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\Construction\LandBenefitVerificationDefinition;

/**
 * Model for LandBenefitVerification (irrigation_land_benefit_verifications).
 */
class LandBenefitVerification extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_land_benefit_verifications';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'benefit_code',
        'scheme_name',
        'benefit_status',
        'verification_ethiopian_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'contract_code',
        'project_code',
        'scheme_type',
        'funding_source',
        'planned_command_ha',
        'actual_developed_ha',
        'operational_cultivated_ha',
        'beneficiaries_male',
        'beneficiaries_female',
        'youth_beneficiaries_count',
        'primary_crops_cultivated',
        'cropping_intensity_ratio',
        'verifying_agronomist',
        'field_survey_remarks',
        'land_development_rate_pct',
        'total_beneficiaries',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'eth_day' => 'integer',
        'planned_command_ha' => 'decimal:2',
        'actual_developed_ha' => 'decimal:2',
        'operational_cultivated_ha' => 'decimal:2',
        'beneficiaries_male' => 'integer',
        'beneficiaries_female' => 'integer',
        'youth_beneficiaries_count' => 'integer',
        'primary_crops_cultivated' => 'array',
        'cropping_intensity_ratio' => 'decimal:2',
        'land_development_rate_pct' => 'decimal:2',
        'total_beneficiaries' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return LandBenefitVerificationDefinition::class;
    }
}
