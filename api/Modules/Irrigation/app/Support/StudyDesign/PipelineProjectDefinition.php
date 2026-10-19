<?php

namespace Modules\Irrigation\Support\StudyDesign;

use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of pipeline records (irrigation_pipeline_projects).
 */
class PipelineProjectDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Pipeline project',
            'code' => 'pipeline_code',
            'status' => ['field' => 'pipeline_status', 'values' => PipelineProjectEnums::STATUSES, 'default' => 'Initial Pipeline Identification'],
            'fields' => [
                'pipeline_code' => self::str(true, 50),
                'scheme_name' => self::str(),
                'initiative_source' => self::in(PipelineProjectEnums::SOURCES),
                'water_source' => self::in(PipelineProjectEnums::WATER_SOURCES),
                'priority_level' => self::in(PipelineProjectEnums::PRIORITY_LEVELS),
                'potential_area_ha' => self::num(),
                'estimated_budget_etb' => self::num(false),
                'estimated_beneficiaries_male' => self::int(),
                'estimated_beneficiaries_female' => self::int(),
                'site_notes' => self::text(),
            ],
            'server' => [
                'promoted_to_study' => false,
                'reconnaissance_expert' => 'Pending Field Reconnaissance',
                'reconnaissance_ethiopian_date' => 'Pending',
                'promoted_study_id' => null,
            ],
            'server_types' => ['promoted_to_study' => 'bool', 'promoted_study_id' => 'int'],
        ];
    }
}
