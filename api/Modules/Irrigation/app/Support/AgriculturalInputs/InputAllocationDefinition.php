<?php

namespace Modules\Irrigation\Support\AgriculturalInputs;

use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of inputs records (irrigation_input_allocations).
 */
class InputAllocationDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Agricultural input allocation',
            'code' => 'input_code',
            'scheme' => null,
            'status' => ['field' => 'status', 'values' => InputAllocationEnums::STATUSES, 'default' => 'Pending', 'server' => true],
            'fields' => [
                'input_code' => self::str(true, 50),
                'irrigation_season' => self::in(InputAllocationEnums::SEASONS),
                'cropping_round' => self::in(InputAllocationEnums::ROUNDS),
                'input_name' => self::in(InputAllocationEnums::NAMES),
                'specification' => self::str(),
                'unit' => self::in(InputAllocationEnums::UNITS),
                'planned_target_qty' => self::num(),
                'covered_hectares' => self::num(),
                'funding_program' => self::in(InputAllocationEnums::FUNDING),
                'beneficiaries_male' => self::int(),
                'beneficiaries_female' => self::int(),
            ],
            'server' => ['distributed_qty' => 0, 'dispatch_history' => []],
            'server_types' => ['distributed_qty' => 'float', 'dispatch_history' => 'array'],
            'computed' => ['item_name' => 'string', 'total_beneficiaries' => 'int'],
        ];
    }
}
