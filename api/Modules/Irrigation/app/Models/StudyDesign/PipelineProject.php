<?php

namespace Modules\Irrigation\Models\StudyDesign;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\StudyDesign\PipelineProjectDefinition;

/**
 * Model for PipelineProject (irrigation_pipeline_projects).
 */
class PipelineProject extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_pipeline_projects';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'pipeline_code',
        'scheme_name',
        'pipeline_status',
        'initiative_source',
        'water_source',
        'priority_level',
        'potential_area_ha',
        'estimated_budget_etb',
        'estimated_beneficiaries_male',
        'estimated_beneficiaries_female',
        'site_notes',
        'promoted_to_study',
        'reconnaissance_expert',
        'reconnaissance_ethiopian_date',
        'promoted_study_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'potential_area_ha' => 'decimal:2',
        'estimated_budget_etb' => 'decimal:2',
        'estimated_beneficiaries_male' => 'integer',
        'estimated_beneficiaries_female' => 'integer',
        'promoted_to_study' => 'boolean',
        'promoted_study_id' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return PipelineProjectDefinition::class;
    }
}
