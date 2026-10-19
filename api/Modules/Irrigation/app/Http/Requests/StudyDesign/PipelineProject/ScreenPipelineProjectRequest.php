<?php

namespace Modules\Irrigation\Http\Requests\StudyDesign\PipelineProject;

use Illuminate\Validation\Rule;
use Modules\Irrigation\Http\Requests\IrrigationActionRequest;
use Modules\Irrigation\Support\IrrigationDefinition;
use Modules\Irrigation\Support\StudyDesign\PipelineProjectEnums;

/**
 * Validates a pipeline reconnaissance/screening decision.
 */
class ScreenPipelineProjectRequest extends IrrigationActionRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'pipeline_status' => ['required', 'string', Rule::in(PipelineProjectEnums::STATUSES)],
            'promoted_to_study' => ['required', 'boolean'],
            'reconnaissance_expert' => ['required', 'string', 'max:255'],
            'site_notes' => ['nullable', 'string', 'max:5000'],
        ] + IrrigationDefinition::dateRules('eth_');
    }
}
