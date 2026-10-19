<?php

namespace Modules\Irrigation\Http\Requests\StudyDesign\ProfessionalTraining;

use Modules\Irrigation\Http\Requests\StoreIrrigationRecordRequest;
use Modules\Irrigation\Models\StudyDesign\ProfessionalTraining;

/**
 * Validates a new professional capacity-building training record.
 */
class StoreProfessionalTrainingRequest extends StoreIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return ProfessionalTraining::class;
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
