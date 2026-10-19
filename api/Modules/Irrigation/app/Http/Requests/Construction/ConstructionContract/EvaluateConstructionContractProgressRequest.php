<?php

namespace Modules\Irrigation\Http\Requests\Construction\ConstructionContract;

use Illuminate\Validation\Rule;
use Modules\Irrigation\Http\Requests\IrrigationActionRequest;
use Modules\Irrigation\Support\Construction\ConstructionContractEnums;
use Modules\Irrigation\Support\Construction\ConstructionWbs;
use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Validates a progress evaluation of a construction contract.
 */
class EvaluateConstructionContractProgressRequest extends IrrigationActionRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'health_status' => ['required', 'string', Rule::in(ConstructionContractEnums::HEALTH_STATUSES)],
            'site_progress_notes' => ['nullable', 'string', 'max:5000'],
            'reporting_ethiopian_date' => ['nullable', 'string', 'max:50'],
        ] + ConstructionWbs::rules() + IrrigationDefinition::dateRules('eth_', false);
    }
}
