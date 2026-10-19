<?php

namespace Modules\Irrigation\Models\StudyDesign;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\StudyDesign\DesignQualityAuditDefinition;

/**
 * Model for DesignQualityAudit (irrigation_design_quality_audits).
 */
class DesignQualityAudit extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_design_quality_audits';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'qa_certificate_no',
        'scheme_name',
        'qa_status',
        'project_id',
        'qa_ethiopian_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'qa_domain',
        'command_area_ha',
        'lead_qa_auditor',
        'qa_institution',
        'compliance_score',
        'qa_audit_findings',
        'project_code',
        'study_modality',
        'linked_review_code',
        'review_verdict_snapshot',
        'review_score_snapshot',
        'review_cleared',
        'verification_checklist',
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
        'compliance_score' => 'integer',
        'review_score_snapshot' => 'integer',
        'review_cleared' => 'boolean',
        'verification_checklist' => 'array',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return DesignQualityAuditDefinition::class;
    }
}
