<?php

namespace Modules\Irrigation\Support\StudyDesign;

use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of capacity-building records (irrigation_professional_trainings).
 */
class ProfessionalTrainingDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Professional capacity-building training',
            'code' => 'training_code',
            'scheme' => null,
            'status' => ['field' => 'training_status', 'values' => ProfessionalTrainingEnums::STATUSES, 'default' => 'Scheduled'],
            'dates' => ['ethiopian_date' => 'eth_'],
            'fields' => [
                'training_code' => self::str(true, 50),
                'course_title' => self::str(),
                'discipline' => self::in(ProfessionalTrainingEnums::DISCIPLINES),
                'target_tier' => self::in(ProfessionalTrainingEnums::TIERS),
                'sponsoring_program' => self::in(ProfessionalTrainingEnums::SPONSORS),
                'training_venue' => self::str(),
                'training_duration_days' => self::int(true, 1, 365),
                'male_participants' => self::int(),
                'female_participants' => self::int(),
                'lead_trainer' => self::str(),
                'course_objectives' => self::text(),
            ],
            'computed' => ['total_participants' => 'int'],
        ];
    }
}
