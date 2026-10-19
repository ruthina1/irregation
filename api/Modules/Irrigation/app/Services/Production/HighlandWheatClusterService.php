<?php

namespace Modules\Irrigation\Services\Production;

use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Models\Production\HighlandWheatCluster;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Business rules of highland irrigated wheat clusters.
 */
class HighlandWheatClusterService extends IrrigationRecordService
{
    public function modelClass(): string
    {
        return HighlandWheatCluster::class;
    }

    /** @param  HighlandWheatCluster  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $area = $this->number($record, 'wheat_command_ha');
        $record->productivity_qt_ha = $area > 0 ? round($this->number($record, 'expected_yield_qt') / $area, 1) : 0;
        $record->total_farmers = $this->total($record, 'farmers_male', 'farmers_female');
        if ($record->mechanized_harvesting === null) {
            $record->mechanized_harvesting = true;
        }
    }
}
