<?php

namespace Modules\Irrigation\Http\Requests\StudyDesign\DesignDocumentReview;

use Modules\Irrigation\Http\Requests\StoreIrrigationRecordRequest;
use Modules\Irrigation\Models\StudyDesign\DesignDocumentReview;

/**
 * Validates a new design document review record.
 */
class StoreDesignDocumentReviewRequest extends StoreIrrigationRecordRequest
{
    protected function modelClass(): string
    {
        return DesignDocumentReview::class;
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
