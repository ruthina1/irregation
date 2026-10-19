<?php

namespace Modules\Irrigation\Http\Requests\Construction\FundingAllocation;

use Modules\Irrigation\Http\Requests\StoreIrrigationRecordRequest;
use Modules\Irrigation\Models\Construction\FundingAllocation;

/**
 * Validates a new funding allocation record.
 */
class StoreFundingAllocationRequest extends StoreIrrigationRecordRequest
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
