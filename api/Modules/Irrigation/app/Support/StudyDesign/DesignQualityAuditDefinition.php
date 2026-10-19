<?php

namespace Modules\Irrigation\Support\StudyDesign;

use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;
use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of quality-assurance records (irrigation_design_quality_audits).
 */
class DesignQualityAuditDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Design quality-assurance audit',
            'code' => 'qa_certificate_no',
            'status' => ['field' => 'qa_status', 'values' => DesignQualityAuditEnums::STATUSES, 'default' => 'Under QA Audit'],
            'parent' => ['field' => 'project_id', 'model' => StudyDesignProject::class, 'required' => true],
            'dates' => ['qa_ethiopian_date' => 'eth_'],
            'fields' => [
                'qa_certificate_no' => self::str(true, 50),
                'qa_domain' => self::in(DesignQualityAuditEnums::DOMAINS),
                'command_area_ha' => self::num(),
                'lead_qa_auditor' => self::str(),
                'qa_institution' => self::str(),
                'compliance_score' => self::int(true, 0, 100),
                'qa_audit_findings' => self::text(),
            ],
            'transient' => self::checks(['check_hydrology', 'check_structural', 'check_geotech', 'check_seepage', 'check_boq', 'check_esia']),
            'computed' => [
                'project_code' => 'string', 'scheme_name' => 'string', 'study_modality' => 'string',
                'linked_review_code' => 'string', 'review_verdict_snapshot' => 'string',
                'review_score_snapshot' => 'int', 'review_cleared' => 'bool',
                'verification_checklist' => 'array',
            ],
        ];
    }
}
