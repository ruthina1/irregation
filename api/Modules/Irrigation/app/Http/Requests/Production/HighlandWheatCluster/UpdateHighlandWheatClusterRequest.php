<?php

namespace Modules\Irrigation\Http\Requests\Production\HighlandWheatCluster;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\Production\HighlandWheatCluster;

/**
 * Validates changes to a highland irrigated wheat cluster record.
 */
class UpdateHighlandWheatClusterRequest extends UpdateIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return HighlandWheatCluster::class;
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
