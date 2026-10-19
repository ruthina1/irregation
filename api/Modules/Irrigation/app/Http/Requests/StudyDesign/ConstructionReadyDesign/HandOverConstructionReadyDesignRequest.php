<?php

namespace Modules\Irrigation\Http\Requests\StudyDesign\ConstructionReadyDesign;

use Illuminate\Validation\Rule;
use Modules\Irrigation\Http\Requests\IrrigationActionRequest;
use Modules\Irrigation\Support\StudyDesign\ConstructionReadyDesignEnums;

/**
 * Validates the handover of a shelf design to the construction directorate.
 */
class HandOverConstructionReadyDesignRequest extends IrrigationActionRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'procurement_method' => ['required', 'string', Rule::in(ConstructionReadyDesignEnums::PROCUREMENT_METHODS)],
            'executing_client' => ['required', 'string', 'max:255'],
            'allocated_budget_etb' => ['required', 'numeric', 'min:0'],
            'handover_notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
