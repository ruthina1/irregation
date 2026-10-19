<?php

namespace Modules\Irrigation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Irrigation\Support\IrrigationInputNormalizer;

/**
 * Base request for an Irrigation workflow action (screening, handover, ...).
 */
abstract class IrrigationActionRequest extends FormRequest
{
    /** Access is enforced by the route's auth + permission middleware. */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->replace(IrrigationInputNormalizer::normalize($this->all()));
    }
}
