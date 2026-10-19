<?php

namespace Modules\Irrigation\Services\Construction;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Modules\Irrigation\Models\Construction\FundingAllocation;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Support\EthiopianCalendar;

/**
 * Business rules of funding allocations: balance, burn rate and IPC
 * disbursements (which also update the contract's financial progress).
 */
class FundingAllocationService extends IrrigationRecordService
{
    public function __construct(private readonly ConstructionContractService $contracts) {}

    public function modelClass(): string
    {
        return FundingAllocation::class;
    }

    /** @param  FundingAllocation  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $allocated = $this->number($record, 'total_allocated_budget_etb');
        $disbursed = $this->number($record, 'cumulative_disbursed_etb');
        $remaining = max(0, $allocated - $disbursed);

        $record->remaining_balance_etb = $remaining;
        $record->financial_burn_rate_pct = $allocated > 0 ? min(100, round($disbursed / $allocated * 100, 1)) : 0;
        if ($creating && blank($input['allocation_status'] ?? null)) {
            $record->allocation_status = $remaining <= 0 && $allocated > 0 ? 'Fully Disbursed' : 'Active Disbursement';
        }
    }

    /**
     * Record a disbursement (IPC payment) against a funding allocation.
     *
     * @param  array<string, mixed>  $input
     */
    public function disburse(FundingAllocation $funding, array $input, ?User $user): IrrigationRecord
    {
        return $this->runAction('disburse', $funding, $user, function (FundingAllocation $funding) use ($input, $user) {
            $amount = round((float) $input['disbursement_amount'], 2);
            $disbursed = $this->number($funding, 'cumulative_disbursed_etb');
            $remaining = max(0, $this->number($funding, 'total_allocated_budget_etb') - $disbursed);

            if ($amount > $remaining + 0.005) {
                throw ValidationException::withMessages([
                    'disbursement_amount' => 'The disbursement amount exceeds the remaining balance of '.number_format($remaining, 2).' ETB.',
                ]);
            }

            $ledger = (array) ($funding->disbursement_ledger ?? []);
            array_unshift($ledger, [
                'id' => (string) Str::uuid(),
                'amount' => $amount,
                'ipc_no' => $input['ipc_no'],
                'eth_date' => EthiopianCalendar::format($input['eth_month'], $input['eth_day'], $input['eth_year']),
                'recipient' => $input['recipient'],
                'voucher_ref' => $input['voucher_ref'] ?? '',
                'recorded_by' => $user?->name,
            ]);

            $funding->disbursement_ledger = $ledger;
            $funding->cumulative_disbursed_etb = $disbursed + $amount;
            $this->fill($funding, [], creating: false);

            $funding->allocation_status = $funding->remaining_balance_etb <= 0 ? 'Fully Disbursed' : 'Active Disbursement';
            $funding->save();

            $contract = $this->contracts->findByCode($funding->contract_code);
            if ($contract) {
                $this->contracts->recordDisbursement($contract, $amount);
            }
        });
    }
}
