<?php

namespace Modules\Irrigation\Http\Requests\StudyDesign\ProfessionalTraining;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\StudyDesign\ProfessionalTraining;

/**
 * Validates changes to a professional capacity-building training record.
 */
class UpdateProfessionalTrainingRequest extends UpdateIrrigationRecordRequest
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
