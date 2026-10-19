<?php

namespace Modules\Irrigation\Http\Requests\StudyDesign\DesignDocumentReview;

use Modules\Irrigation\Http\Requests\UpdateIrrigationRecordRequest;
use Modules\Irrigation\Models\StudyDesign\DesignDocumentReview;

/**
 * Validates changes to a design document review record.
 */
class UpdateDesignDocumentReviewRequest extends UpdateIrrigationRecordRequest
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
