<?php

namespace Modules\Irrigation\Http\Requests\Institutions\SchemeMaintenance;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\Institutions\SchemeMaintenance;

/**
 * Validates changes to a scheme maintenance & cleaning activity record.
 */
class UpdateSchemeMaintenanceRequest extends UpdateIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return SchemeMaintenance::class;
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
