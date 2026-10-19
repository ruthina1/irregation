<?php

namespace Modules\Irrigation\Http\Requests\Institutions\WaterUsersAssociation;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\Institutions\WaterUsersAssociation;

/**
 * Validates changes to a water users' association record.
 */
class UpdateWaterUsersAssociationRequest extends UpdateIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return WaterUsersAssociation::class;
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
