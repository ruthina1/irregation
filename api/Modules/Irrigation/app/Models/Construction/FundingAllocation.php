<?php

namespace Modules\Irrigation\Models\Construction;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\Construction\FundingAllocationDefinition;

/**
 * Model for FundingAllocation (irrigation_funding_allocations).
 */
class FundingAllocation extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_funding_allocations';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'funding_code',
        'scheme_name',
        'allocation_status',
        'contract_code',
        'project_code',
        'funding_program',
        'donor_account_ref',
        'total_allocated_budget_etb',
        'cumulative_disbursed_etb',
        'financial_notes',
        'disbursement_ledger',
        'remaining_balance_etb',
        'financial_burn_rate_pct',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'total_allocated_budget_etb' => 'decimal:2',
        'cumulative_disbursed_etb' => 'decimal:2',
        'disbursement_ledger' => 'array',
        'remaining_balance_etb' => 'decimal:2',
        'financial_burn_rate_pct' => 'decimal:2',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return FundingAllocationDefinition::class;
    }
}
