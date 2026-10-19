<?php

namespace Modules\Irrigation\Http\Requests\Construction\ConstructionProgressLog;

use Modules\Irrigation\Http\Requests\StoreIrrigationRecordRequest;
use Modules\Irrigation\Models\Construction\ConstructionProgressLog;

/**
 * Validates a new construction progress log record.
 */
class StoreConstructionProgressLogRequest extends StoreIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return ConstructionProgressLog::class;
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
