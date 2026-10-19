<?php

namespace Modules\Irrigation\Support\StudyDesign;

use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of study-design records (irrigation_study_design_projects).
 */
class StudyDesignProjectDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Study & design project',
            'code' => 'project_code',
            'scheme' => 'project_name',
            'status' => ['field' => 'study_stage', 'values' => StudyDesignProjectEnums::STAGES, 'default' => 'Detailed Engineering Design', 'required' => true],
            'fields' => [
                'project_code' => self::str(true, 50),
                'project_name' => self::str(),
                'study_modality' => self::in(StudyDesignProjectEnums::MODALITIES),
                'water_source' => self::in(StudyDesignProjectEnums::WATER_SOURCES),
                'lead_consultant_or_office' => self::str(),
                'study_cost_etb' => self::num(false),
                'command_area_hectares' => self::num(),
                'beneficiaries_male' => self::int(),
                'beneficiaries_female' => self::int(),
                'experts_trained_male' => self::int(),
                'experts_trained_female' => self::int(),
                'is_construction_ready' => self::bool(true),
            ],
            'server' => [
                'review_status' => 'Pending Document Review',
                'qa_status' => 'Pending QA Audit',
                'review_notes' => 'Initial study parameters logged.',
                'reviewed_by' => null,
                'review_ethiopian_date' => null,
                'pipeline_code' => null,
                'pipeline_id' => null,
            ],
            'server_types' => ['pipeline_id' => 'int'],
            'presented' => [
                'latest_review_code' => 'string',
                'latest_review_verdict' => 'string',
                'latest_review_score' => 'int',
                'review_cleared' => 'bool',
            ],
        ];
    }
}
