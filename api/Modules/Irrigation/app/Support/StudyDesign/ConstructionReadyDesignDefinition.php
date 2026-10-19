<?php

namespace Modules\Irrigation\Support\StudyDesign;

use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;
use Modules\Irrigation\Support\IrrigationDefinition;
use Modules\Irrigation\Support\IrrigationEnums;

/**
 * Fields and validation of construction-ready records (irrigation_construction_ready_designs).
 */
class ConstructionReadyDesignDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Construction-ready design',
            'code' => 'shelf_code',
            'generate' => 'SHLF',
            'status' => ['field' => 'shelf_status', 'values' => ConstructionReadyDesignEnums::STATUSES, 'default' => 'Available on Shelf'],
            'parent' => ['field' => 'project_id', 'model' => StudyDesignProject::class, 'required' => false],
            'fields' => [
                'preferred_funding_channel' => self::in(IrrigationEnums::FUNDING_SOURCES, false),
                'estimated_construction_etb' => self::num(false),
                'scheme_type' => self::in(IrrigationEnums::SCHEME_TYPES, false),
                'procurement_remarks' => self::text(),
            ],
            'server' => [
                'project_code' => null, 'study_modality' => null, 'water_source' => null,
                'command_area_ha' => 0, 'beneficiaries_male' => 0, 'beneficiaries_female' => 0,
                'qa_certificate_no' => null, 'shelf_entry_ethiopian_date' => null,
                'tender_dossier' => [], 'handover_details' => null,
            ],
            'server_types' => [
                'command_area_ha' => 'float', 'beneficiaries_male' => 'int', 'beneficiaries_female' => 'int',
                'tender_dossier' => 'array', 'handover_details' => 'array',
            ],
        ];
    }
}
