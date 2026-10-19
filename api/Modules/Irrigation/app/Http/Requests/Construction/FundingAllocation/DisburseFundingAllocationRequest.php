<?php

namespace Modules\Irrigation\Http\Requests\Construction\FundingAllocation;

use Modules\Irrigation\Http\Requests\IrrigationActionRequest;
use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Validates a disbursement (IPC payment) against a funding allocation.
 */
class DisburseFundingAllocationRequest extends IrrigationActionRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'disbursement_amount' => ['required', 'numeric', 'gt:0'],
            'ipc_no' => ['required', 'string', 'max:50'],
            'recipient' => ['required', 'string', 'max:255'],
            'voucher_ref' => ['nullable', 'string', 'max:100'],
        ] + IrrigationDefinition::dateRules('eth_');
    }
}
