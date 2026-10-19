<?php

namespace Modules\Irrigation\Models\WaterUtilization;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\WaterUtilization\IrrigatedAreaDefinition;

/**
 * Model for IrrigatedArea (irrigation_irrigated_areas).
 */
class IrrigatedArea extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_irrigated_areas';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'utilization_code',
        'scheme_name',
        'water_adequacy_status',
        'reporting_ethiopian_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'scheme_code',
        'cropping_round',
        'wua_name',
        'land_modality',
        'expansion_method',
        'planned_command_ha',
        'actual_irrigated_ha',
        'expansion_area_ha',
        'farmers_male',
        'farmers_female',
        'dominant_crops',
        'verifying_expert',
        'field_observations',
        'total_effective_irrigated_ha',
        'utilization_rate_pct',
        'total_farmers',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'eth_day' => 'integer',
        'planned_command_ha' => 'decimal:2',
        'actual_irrigated_ha' => 'decimal:2',
        'expansion_area_ha' => 'decimal:2',
        'farmers_male' => 'integer',
        'farmers_female' => 'integer',
        'total_effective_irrigated_ha' => 'decimal:2',
        'utilization_rate_pct' => 'decimal:2',
        'total_farmers' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return IrrigatedAreaDefinition::class;
    }
}
