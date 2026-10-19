<?php

namespace Modules\Irrigation\Models\StudyDesign;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\StudyDesign\ConstructionReadyDesignDefinition;

/**
 * Model for ConstructionReadyDesign (irrigation_construction_ready_designs).
 */
class ConstructionReadyDesign extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_construction_ready_designs';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'shelf_code',
        'scheme_name',
        'shelf_status',
        'project_id',
        'preferred_funding_channel',
        'estimated_construction_etb',
        'scheme_type',
        'procurement_remarks',
        'project_code',
        'study_modality',
        'water_source',
        'command_area_ha',
        'beneficiaries_male',
        'beneficiaries_female',
        'qa_certificate_no',
        'shelf_entry_ethiopian_date',
        'tender_dossier',
        'handover_details',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'project_id' => 'integer',
        'estimated_construction_etb' => 'decimal:2',
        'command_area_ha' => 'decimal:2',
        'beneficiaries_male' => 'integer',
        'beneficiaries_female' => 'integer',
        'tender_dossier' => 'array',
        'handover_details' => 'array',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return ConstructionReadyDesignDefinition::class;
    }
}
