<?php

namespace Modules\Irrigation\Models\Construction;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\Construction\ConstructionContractDefinition;

/**
 * Model for ConstructionContract (irrigation_construction_contracts).
 */
class ConstructionContract extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_construction_contracts';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'contract_code',
        'scheme_name',
        'construction_status',
        'contract_signing_eth_date',
        'eth_start_month',
        'eth_start_day',
        'eth_start_year',
        'planned_completion_eth_date',
        'eth_end_month',
        'eth_end_day',
        'eth_end_year',
        'project_code',
        'scheme_type',
        'funding_source',
        'contractor_name',
        'contractor_grade',
        'consultant_supervisor',
        'contract_sum_etb',
        'defect_liability_months',
        'physical_progress_pct',
        'command_area_ha',
        'beneficiaries_male',
        'beneficiaries_female',
        'site_progress_notes',
        'disbursed_sum_etb',
        'financial_progress_pct',
        'planned_progress_pct',
        'health_status',
        'weir_concreting_pct',
        'canal_excavation_pct',
        'canal_lining_km',
        'target_canal_lining_km',
        'gates_installed_count',
        'target_gates_count',
        'resident_engineer',
        'reporting_ethiopian_date',
        'total_beneficiaries',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'eth_start_day' => 'integer',
        'eth_end_day' => 'integer',
        'contract_sum_etb' => 'decimal:2',
        'defect_liability_months' => 'integer',
        'physical_progress_pct' => 'decimal:2',
        'command_area_ha' => 'decimal:2',
        'beneficiaries_male' => 'integer',
        'beneficiaries_female' => 'integer',
        'disbursed_sum_etb' => 'decimal:2',
        'financial_progress_pct' => 'decimal:2',
        'planned_progress_pct' => 'decimal:2',
        'weir_concreting_pct' => 'decimal:2',
        'canal_excavation_pct' => 'decimal:2',
        'canal_lining_km' => 'decimal:2',
        'target_canal_lining_km' => 'decimal:2',
        'gates_installed_count' => 'integer',
        'target_gates_count' => 'integer',
        'total_beneficiaries' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return ConstructionContractDefinition::class;
    }
}
