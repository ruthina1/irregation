<?php

namespace Modules\Irrigation\Http\Requests\StudyDesign\ConstructionReadyDesign;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\StudyDesign\ConstructionReadyDesign;

/**
 * Validates changes to a construction-ready design record.
 */
class UpdateConstructionReadyDesignRequest extends UpdateIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return ConstructionReadyDesign::class;
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
