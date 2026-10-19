<?php

namespace Modules\Irrigation\Http\Requests\Construction\HandoverCertificate;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\Construction\HandoverCertificate;

/**
 * Validates changes to a project completion & handover certificate record.
 */
class UpdateHandoverCertificateRequest extends UpdateIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return HandoverCertificate::class;
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
