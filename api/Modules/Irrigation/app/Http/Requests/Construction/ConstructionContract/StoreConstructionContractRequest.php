<?php

namespace Modules\Irrigation\Http\Requests\Construction\ConstructionContract;

use Modules\Irrigation\Http\Requests\StoreIrrigationRecordRequest;
use Modules\Irrigation\Models\Construction\ConstructionContract;

/**
 * Validates a new construction contract record.
 */
class StoreConstructionContractRequest extends StoreIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return ConstructionContract::class;
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
