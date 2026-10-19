<?php

namespace Modules\Irrigation\Http\Requests\Construction\ConstructionContract;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\Construction\ConstructionContract;

/**
 * Validates changes to a construction contract record.
 */
class UpdateConstructionContractRequest extends UpdateIrrigationRecordRequest
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
