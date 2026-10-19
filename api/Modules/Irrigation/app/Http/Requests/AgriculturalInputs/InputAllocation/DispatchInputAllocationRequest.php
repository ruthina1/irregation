<?php

namespace Modules\Irrigation\Http\Requests\AgriculturalInputs\InputAllocation;

use Modules\Irrigation\Http\Requests\IrrigationActionRequest;
use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Validates a dispatch of an input allocation.
 */
class DispatchInputAllocationRequest extends IrrigationActionRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'dispatch_qty' => ['required', 'numeric', 'gt:0'],
            'recipient' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ] + IrrigationDefinition::dateRules('eth_');
    }
}
