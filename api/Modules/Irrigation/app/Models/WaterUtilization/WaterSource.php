<?php

namespace Modules\Irrigation\Models\WaterUtilization;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\WaterUtilization\WaterSourceDefinition;

/**
 * Model for WaterSource (irrigation_water_sources).
 */
class WaterSource extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_water_sources';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'scheme_name',
        'operational_status',
        'wua_name',
        'technology_type',
        'equipment_units_count',
        'discharge_capacity_liters_sec',
        'command_area_served_ha',
        'energy_source',
        'farmers_male',
        'farmers_female',
        'installation_eth_year',
        'technical_specs',
        'source_category',
        'total_farmers',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'equipment_units_count' => 'integer',
        'discharge_capacity_liters_sec' => 'decimal:2',
        'command_area_served_ha' => 'decimal:2',
        'farmers_male' => 'integer',
        'farmers_female' => 'integer',
        'total_farmers' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return WaterSourceDefinition::class;
    }
}
