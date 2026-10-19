<?php

namespace Modules\Irrigation\Support\StudyDesign;

use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;
use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of document-review records (irrigation_design_document_reviews).
 */
class DesignDocumentReviewDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Design document review',
            'code' => 'review_code',
            'status' => ['field' => 'review_verdict', 'values' => DesignDocumentReviewEnums::VERDICTS, 'default' => 'Under Review'],
            'parent' => ['field' => 'project_id', 'model' => StudyDesignProject::class, 'required' => true],
            'dates' => ['review_ethiopian_date' => 'eth_'],
            'fields' => [
                'review_code' => self::str(true, 50),
                'submitting_entity' => self::str(),
                'command_area_ha' => self::num(),
                'review_milestone' => self::in(DesignDocumentReviewEnums::MILESTONES),
                'document_volume' => self::in(DesignDocumentReviewEnums::VOLUMES),
                'submission_version' => self::str(true, 100),
                'lead_reviewer' => self::str(),
                'review_team_size' => self::int(false, 1, 15),
                'overall_technical_score' => self::int(true, 0, 100),
                'technical_remarks' => self::text(),
            ],
            'transient' => self::checks(['check_hydrology', 'check_structural', 'check_geotechnical', 'check_agronomy', 'check_esia']),
            'computed' => [
                'project_code' => 'string', 'scheme_name' => 'string', 'document_source' => 'string',
                'disciplinary_checklist' => 'array',
            ],
        ];
    }
}
