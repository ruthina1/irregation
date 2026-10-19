<?php

namespace Modules\Irrigation\Models\StudyDesign;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\StudyDesign\DesignDocumentReviewDefinition;

/**
 * Model for DesignDocumentReview (irrigation_design_document_reviews).
 */
class DesignDocumentReview extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_design_document_reviews';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'review_code',
        'scheme_name',
        'review_verdict',
        'project_id',
        'review_ethiopian_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'submitting_entity',
        'command_area_ha',
        'review_milestone',
        'document_volume',
        'submission_version',
        'lead_reviewer',
        'review_team_size',
        'overall_technical_score',
        'technical_remarks',
        'project_code',
        'document_source',
        'disciplinary_checklist',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'project_id' => 'integer',
        'eth_day' => 'integer',
        'command_area_ha' => 'decimal:2',
        'review_team_size' => 'integer',
        'overall_technical_score' => 'integer',
        'disciplinary_checklist' => 'array',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return DesignDocumentReviewDefinition::class;
    }
}
