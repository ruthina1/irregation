<?php

namespace Modules\Irrigation\Http\Requests\Construction\LandBenefitVerification;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\Construction\LandBenefitVerification;

/**
 * Validates changes to a developed land & beneficiaries verification record.
 */
class UpdateLandBenefitVerificationRequest extends UpdateIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return LandBenefitVerification::class;
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
