<?php

namespace Modules\Irrigation\Services\WaterUtilization;

use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Models\WaterUtilization\IrrigatedArea;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Business rules of irrigated land utilization records.
 */
class IrrigatedAreaService extends IrrigationRecordService
{
    public function modelClass(): string
    {
        return IrrigatedArea::class;
    }

    /** @param  IrrigatedArea  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $record->expansion_area_ha = $this->number($record, 'expansion_area_ha');
        $effective = $this->number($record, 'actual_irrigated_ha') + $record->expansion_area_ha;
        $planned = $this->number($record, 'planned_command_ha');

        $record->total_effective_irrigated_ha = $effective;
        $record->utilization_rate_pct = $planned > 0 ? round($effective / $planned * 100, 1) : 0;
        $record->total_farmers = $this->total($record, 'farmers_male', 'farmers_female');
    }
}
