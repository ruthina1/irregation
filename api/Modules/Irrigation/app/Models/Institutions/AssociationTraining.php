<?php

namespace Modules\Irrigation\Models\Institutions;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\Institutions\AssociationTrainingDefinition;

/**
 * Model for AssociationTraining (irrigation_association_trainings).
 */
class AssociationTraining extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_association_trainings';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'training_code',
        'scheme_name',
        'training_status',
        'wua_id',
        'ethiopian_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'target_group',
        'training_module',
        'facilitator_channel',
        'training_venue',
        'training_duration_days',
        'exec_leaders_male',
        'exec_leaders_female',
        'members_male',
        'members_female',
        'lead_facilitator',
        'course_learning_outcomes',
        'total_trainees',
        'wua_name',
        'wua_reg_code',
        'project_code',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'wua_id' => 'integer',
        'eth_day' => 'integer',
        'training_duration_days' => 'integer',
        'exec_leaders_male' => 'integer',
        'exec_leaders_female' => 'integer',
        'members_male' => 'integer',
        'members_female' => 'integer',
        'total_trainees' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return AssociationTrainingDefinition::class;
    }
}
