<?php

namespace Modules\Irrigation\Http\Requests\StudyDesign\StudyDesignProject;

use Illuminate\Validation\Rule;
use Modules\Irrigation\Http\Requests\IrrigationActionRequest;
use Modules\Irrigation\Support\IrrigationDefinition;
use Modules\Irrigation\Support\StudyDesign\StudyDesignProjectEnums;

/**
 * Validates the review and QA decision on a study-design project.
 */
class ReviewStudyDesignProjectRequest extends IrrigationActionRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'review_status' => ['required', 'string', Rule::in(StudyDesignProjectEnums::REVIEW_STATUSES)],
            'qa_status' => ['required', 'string', Rule::in(StudyDesignProjectEnums::QA_STATUSES)],
            'is_construction_ready' => ['required', 'boolean'],
            'reviewer_expert' => ['required', 'string', 'max:255'],
            'review_notes' => ['nullable', 'string', 'max:5000'],
        ] + IrrigationDefinition::dateRules('eth_');
    }
}
