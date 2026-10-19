<?php

namespace Modules\Irrigation\Models\Construction;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\Construction\ConstructionProgressLogDefinition;

/**
 * Model for ConstructionProgressLog (irrigation_construction_progress_logs).
 */
class ConstructionProgressLog extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_construction_progress_logs';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'progress_log_code',
        'scheme_name',
        'health_status',
        'contract_id',
        'reporting_ethiopian_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'site_engineering_remarks',
        'planned_progress_pct',
        'physical_progress_pct',
        'financial_progress_pct',
        'weir_concreting_pct',
        'canal_excavation_pct',
        'canal_lining_km',
        'target_canal_lining_km',
        'gates_installed_count',
        'target_gates_count',
        'resident_engineer',
        'contract_code',
        'project_code',
        'scheme_type',
        'contract_sum_etb',
        'command_area_ha',
        'disbursed_sum_etb',
        'variance_pct',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'contract_id' => 'integer',
        'eth_day' => 'integer',
        'planned_progress_pct' => 'decimal:2',
        'physical_progress_pct' => 'decimal:2',
        'financial_progress_pct' => 'decimal:2',
        'weir_concreting_pct' => 'decimal:2',
        'canal_excavation_pct' => 'decimal:2',
        'canal_lining_km' => 'decimal:2',
        'target_canal_lining_km' => 'decimal:2',
        'gates_installed_count' => 'integer',
        'target_gates_count' => 'integer',
        'contract_sum_etb' => 'decimal:2',
        'command_area_ha' => 'decimal:2',
        'disbursed_sum_etb' => 'decimal:2',
        'variance_pct' => 'decimal:2',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return ConstructionProgressLogDefinition::class;
    }
}
