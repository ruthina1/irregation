<?php

namespace Modules\Irrigation\Http\Requests\WaterUtilization\WaterSource;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\WaterUtilization\WaterSource;

/**
 * Validates changes to a water source & irrigation technology record.
 */
class UpdateWaterSourceRequest extends UpdateIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return WaterSource::class;
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
