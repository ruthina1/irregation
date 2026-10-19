<?php

namespace Modules\Irrigation\Http\Requests\Institutions\AssociationAudit;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\Institutions\AssociationAudit;

/**
 * Validates changes to a WUA strengthening audit record.
 */
class UpdateAssociationAuditRequest extends UpdateIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return AssociationAudit::class;
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
