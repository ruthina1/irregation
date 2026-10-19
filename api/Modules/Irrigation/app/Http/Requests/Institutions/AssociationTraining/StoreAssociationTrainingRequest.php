<?php

namespace Modules\Irrigation\Http\Requests\Institutions\AssociationTraining;

use Modules\Irrigation\Http\Requests\StoreIrrigationRecordRequest;
use Modules\Irrigation\Models\Institutions\AssociationTraining;

/**
 * Validates a new WUA capacity-building training record.
 */
class StoreAssociationTrainingRequest extends StoreIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return AssociationTraining::class;
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
