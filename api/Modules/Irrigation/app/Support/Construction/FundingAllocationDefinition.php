<?php

namespace Modules\Irrigation\Support\Construction;

use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of construction/funding records (irrigation_funding_allocations).
 */
class FundingAllocationDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Funding allocation',
            'code' => 'funding_code',
            'status' => ['field' => 'allocation_status', 'values' => FundingAllocationEnums::STATUSES, 'default' => 'Active Disbursement'],
            'fields' => [
                'funding_code' => self::str(true, 50),
                'scheme_name' => self::str(),
                'contract_code' => self::str(true, 50),
                'project_code' => self::str(true, 50),
                'funding_program' => self::in(FundingAllocationEnums::PROGRAMS),
                'donor_account_ref' => self::str(),
                'total_allocated_budget_etb' => self::num(),
                'cumulative_disbursed_etb' => self::num(),
                'financial_notes' => self::text(),
            ],
            'server' => ['disbursement_ledger' => []],
            'server_types' => ['disbursement_ledger' => 'array'],
            'computed' => ['remaining_balance_etb' => 'float', 'financial_burn_rate_pct' => 'float'],
        ];
    }

    /**
     * Construction contracts store funding labels such as
     * "Regional Government Capital Budget (በክልል መንግስት በጀት)"; the funding
     * ledger uses short program names. Map one onto the other.
     */
    public static function normalize(array $input): array
    {
        if (isset($input['funding_program']) && is_string($input['funding_program'])) {
            $input['funding_program'] = self::financingProgram($input['funding_program']);
        }

        return $input;
    }

    public static function financingProgram(string $value): string
    {
        if (in_array($value, FundingAllocationEnums::PROGRAMS, true)) {
            return $value;
        }

        foreach (FundingAllocationEnums::PROGRAM_ALIASES as $alias => $program) {
            if (str_starts_with($value, $alias)) {
                return $program;
            }
        }

        $short = trim(explode('(', $value)[0]);

        return FundingAllocationEnums::PROGRAM_ALIASES[$short] ?? $short;
    }
}
