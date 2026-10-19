<?php

namespace Modules\Irrigation\Http\Requests\StudyDesign\StudyDesignProject;

use Modules\Irrigation\Http\Requests\StoreIrrigationRecordRequest;
use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;

/**
 * Validates a new study & design project record.
 */
class StoreStudyDesignProjectRequest extends StoreIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return StudyDesignProject::class;
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
