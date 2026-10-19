<?php

namespace Modules\Irrigation\Models\StudyDesign;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\StudyDesign\ProfessionalTrainingDefinition;

/**
 * Model for ProfessionalTraining (irrigation_professional_trainings).
 */
class ProfessionalTraining extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_professional_trainings';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'training_code',
        'training_status',
        'ethiopian_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'course_title',
        'discipline',
        'target_tier',
        'sponsoring_program',
        'training_venue',
        'training_duration_days',
        'male_participants',
        'female_participants',
        'lead_trainer',
        'course_objectives',
        'total_participants',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'eth_day' => 'integer',
        'training_duration_days' => 'integer',
        'male_participants' => 'integer',
        'female_participants' => 'integer',
        'total_participants' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return ProfessionalTrainingDefinition::class;
    }
}
