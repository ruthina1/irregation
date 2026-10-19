<?php

namespace Modules\Irrigation\Models\AgriculturalInputs;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\AgriculturalInputs\InputAllocationDefinition;

/**
 * Model for InputAllocation (irrigation_input_allocations).
 */
class InputAllocation extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_input_allocations';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'input_code',
        'status',
        'irrigation_season',
        'cropping_round',
        'input_name',
        'specification',
        'unit',
        'planned_target_qty',
        'covered_hectares',
        'funding_program',
        'beneficiaries_male',
        'beneficiaries_female',
        'distributed_qty',
        'dispatch_history',
        'item_name',
        'total_beneficiaries',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'planned_target_qty' => 'decimal:2',
        'covered_hectares' => 'decimal:2',
        'beneficiaries_male' => 'integer',
        'beneficiaries_female' => 'integer',
        'distributed_qty' => 'decimal:2',
        'dispatch_history' => 'array',
        'total_beneficiaries' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return InputAllocationDefinition::class;
    }
}
