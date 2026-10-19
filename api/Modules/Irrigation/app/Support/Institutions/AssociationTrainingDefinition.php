<?php

namespace Modules\Irrigation\Support\Institutions;

use Modules\Irrigation\Models\Institutions\WaterUsersAssociation;
use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of institutions/capacity-building records (irrigation_association_trainings).
 */
class AssociationTrainingDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'WUA capacity-building training',
            'code' => 'training_code',
            'status' => ['field' => 'training_status', 'values' => AssociationTrainingEnums::STATUSES, 'default' => 'Scheduled'],
            'parent' => ['field' => 'wua_id', 'model' => WaterUsersAssociation::class, 'required' => true],
            'dates' => ['ethiopian_date' => 'eth_'],
            'fields' => [
                'training_code' => self::str(true, 50),
                'fiscal_year' => self::fiscalYear(),
                'target_group' => self::in(AssociationTrainingEnums::TARGET_GROUPS),
                'training_module' => self::in(AssociationTrainingEnums::MODULES),
                'facilitator_channel' => self::in(AssociationTrainingEnums::FACILITATORS),
                'training_venue' => self::str(),
                'training_duration_days' => self::int(true, 1, 15),
                'exec_leaders_male' => self::int(),
                'exec_leaders_female' => self::int(),
                'members_male' => self::int(),
                'members_female' => self::int(),
                'lead_facilitator' => self::str(),
                'course_learning_outcomes' => self::text(),
            ],
            'computed' => [
                'total_trainees' => 'int', 'wua_name' => 'string', 'wua_reg_code' => 'string', 'project_code' => 'string',
            ],
        ];
    }
}
