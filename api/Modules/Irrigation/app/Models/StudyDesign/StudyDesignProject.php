<?php

namespace Modules\Irrigation\Models\StudyDesign;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\StudyDesign\StudyDesignProjectDefinition;

/**
 * Model for StudyDesignProject (irrigation_study_design_projects).
 */
class StudyDesignProject extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_study_design_projects';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'project_code',
        'project_name',
        'study_stage',
        'study_modality',
        'water_source',
        'lead_consultant_or_office',
        'study_cost_etb',
        'command_area_hectares',
        'beneficiaries_male',
        'beneficiaries_female',
        'experts_trained_male',
        'experts_trained_female',
        'is_construction_ready',
        'review_status',
        'qa_status',
        'review_notes',
        'reviewed_by',
        'review_ethiopian_date',
        'pipeline_code',
        'pipeline_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'study_cost_etb' => 'decimal:2',
        'command_area_hectares' => 'decimal:2',
        'beneficiaries_male' => 'integer',
        'beneficiaries_female' => 'integer',
        'experts_trained_male' => 'integer',
        'experts_trained_female' => 'integer',
        'is_construction_ready' => 'boolean',
        'pipeline_id' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return StudyDesignProjectDefinition::class;
    }
}
