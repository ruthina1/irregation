<?php

namespace Modules\Irrigation\Models\Production;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\Production\HighlandWheatClusterDefinition;

/**
 * Model for HighlandWheatCluster (irrigation_highland_wheat_clusters).
 */
class HighlandWheatCluster extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_highland_wheat_clusters';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'initiative_code',
        'scheme_name',
        'verification_status',
        'field_survey_eth_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'scheme_code',
        'wua_name',
        'cropping_round',
        'wheat_variety',
        'cluster_block_code',
        'wheat_command_ha',
        'expected_yield_qt',
        'farmers_male',
        'farmers_female',
        'mechanized_harvesting',
        'lead_agronomist',
        'initiative_notes',
        'productivity_qt_ha',
        'total_farmers',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'eth_day' => 'integer',
        'wheat_command_ha' => 'decimal:2',
        'expected_yield_qt' => 'decimal:2',
        'farmers_male' => 'integer',
        'farmers_female' => 'integer',
        'mechanized_harvesting' => 'boolean',
        'productivity_qt_ha' => 'decimal:2',
        'total_farmers' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return HighlandWheatClusterDefinition::class;
    }
}
