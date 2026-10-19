<?php

namespace Modules\Irrigation\Http\Requests\AgriculturalInputs\InputAllocation;

use Modules\Irrigation\Http\Requests\StoreIrrigationRecordRequest;
use Modules\Irrigation\Models\AgriculturalInputs\InputAllocation;

/**
 * Validates a new agricultural input allocation record.
 */
class StoreInputAllocationRequest extends StoreIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return InputAllocation::class;
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
