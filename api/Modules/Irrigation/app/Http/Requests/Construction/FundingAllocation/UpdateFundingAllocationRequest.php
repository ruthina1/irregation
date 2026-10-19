<?php

namespace Modules\Irrigation\Http\Requests\Construction\FundingAllocation;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\Construction\FundingAllocation;

/**
 * Validates changes to a funding allocation record.
 */
class UpdateFundingAllocationRequest extends UpdateIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return FundingAllocation::class;
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
