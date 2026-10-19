<?php

namespace Modules\Irrigation\Http\Requests\WaterUtilization\IrrigatedArea;

use Modules\Irrigation\Http\Requests\StoreIrrigationRecordRequest;
use Modules\Irrigation\Models\WaterUtilization\IrrigatedArea;

/**
 * Validates a new irrigated land utilization record record.
 */
class StoreIrrigatedAreaRequest extends StoreIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return IrrigatedArea::class;
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
