<?php

namespace Modules\Irrigation\Services\Production;

use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Models\Production\SeasonalProduction;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Business rules of seasonal crop production records.
 */
class SeasonalProductionService extends IrrigationRecordService
{
    public function modelClass(): string
    {
        return SeasonalProduction::class;
    }

    /** @param  SeasonalProduction  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $area = $this->number($record, 'cultivated_area_ha');
        $record->productivity_qt_per_ha = $area > 0 ? round($this->number($record, 'production_yield_quintals') / $area, 1) : 0;
        $record->total_farmers = $this->total($record, 'farmers_male', 'farmers_female');
    }
}
