<?php

namespace Modules\Irrigation\Http\Requests\StudyDesign\PipelineProject;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\StudyDesign\PipelineProject;

/**
 * Validates changes to a pipeline project record.
 */
class UpdatePipelineProjectRequest extends UpdateIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return PipelineProject::class;
    }

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return parent::rules();
    }
}
