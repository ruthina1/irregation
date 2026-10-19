<?php

namespace Modules\Irrigation\Http\Requests\Production\SeasonalProduction;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\Production\SeasonalProduction;

/**
 * Validates changes to a seasonal crop production record record.
 */
class UpdateSeasonalProductionRequest extends UpdateIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return SeasonalProduction::class;
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
