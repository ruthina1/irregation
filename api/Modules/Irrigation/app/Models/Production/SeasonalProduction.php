<?php

namespace Modules\Irrigation\Models\Production;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\Production\SeasonalProductionDefinition;

/**
 * Model for SeasonalProduction (irrigation_seasonal_productions).
 */
class SeasonalProduction extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_seasonal_productions';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'production_code',
        'scheme_name',
        'harvest_status',
        'survey_ethiopian_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'scheme_code',
        'wua_name',
        'cropping_round',
        'crop_category',
        'specific_crop',
        'cultivated_area_ha',
        'production_yield_quintals',
        'farmers_male',
        'farmers_female',
        'verifying_agronomist',
        'agronomic_remarks',
        'productivity_qt_per_ha',
        'total_farmers',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'eth_day' => 'integer',
        'cultivated_area_ha' => 'decimal:2',
        'production_yield_quintals' => 'decimal:2',
        'farmers_male' => 'integer',
        'farmers_female' => 'integer',
        'productivity_qt_per_ha' => 'decimal:2',
        'total_farmers' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return SeasonalProductionDefinition::class;
    }
}
