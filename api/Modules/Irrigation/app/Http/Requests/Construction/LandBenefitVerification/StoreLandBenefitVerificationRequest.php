<?php

namespace Modules\Irrigation\Http\Requests\Construction\LandBenefitVerification;

use Modules\Irrigation\Http\Requests\StoreIrrigationRecordRequest;
use Modules\Irrigation\Models\Construction\LandBenefitVerification;

/**
 * Validates a new developed land & beneficiaries verification record.
 */
class StoreLandBenefitVerificationRequest extends StoreIrrigationRecordRequest
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
