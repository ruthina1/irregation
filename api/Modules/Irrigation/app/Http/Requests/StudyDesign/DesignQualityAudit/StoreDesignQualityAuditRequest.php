<?php

namespace Modules\Irrigation\Http\Requests\StudyDesign\DesignQualityAudit;

use Modules\Irrigation\Http\Requests\StoreIrrigationRecordRequest;
use Modules\Irrigation\Models\StudyDesign\DesignQualityAudit;

/**
 * Validates a new design quality-assurance audit record.
 */
class StoreDesignQualityAuditRequest extends StoreIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return DesignQualityAudit::class;
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
