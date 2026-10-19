<?php

namespace Modules\Irrigation\Models\Institutions;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\Institutions\SchemeMaintenanceDefinition;

/**
 * Model for SchemeMaintenance (irrigation_scheme_maintenances).
 */
class SchemeMaintenance extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_scheme_maintenances';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'scheme_name',
        'operation_status',
        'activity_ethiopian_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'canal_type',
        'wua_name',
        'intervention_types',
        'repaired_cleaned_km',
        'command_area_protected_ha',
        'financial_cost_etb',
        'mobilized_labor_male',
        'mobilized_labor_female',
        'funding_source',
        'lead_coordinator',
        'field_remarks',
        'total_mobilized_labor',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'eth_day' => 'integer',
        'intervention_types' => 'array',
        'repaired_cleaned_km' => 'decimal:2',
        'command_area_protected_ha' => 'decimal:2',
        'financial_cost_etb' => 'decimal:2',
        'mobilized_labor_male' => 'integer',
        'mobilized_labor_female' => 'integer',
        'total_mobilized_labor' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return SchemeMaintenanceDefinition::class;
    }
}
