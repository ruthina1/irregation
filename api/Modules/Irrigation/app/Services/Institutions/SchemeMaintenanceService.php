<?php

namespace Modules\Irrigation\Services\Institutions;

use Modules\Irrigation\Models\Institutions\SchemeMaintenance;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Business rules of scheme maintenance & cleaning activities.
 */
class SchemeMaintenanceService extends IrrigationRecordService
{
    public function modelClass(): string
    {
        return SchemeMaintenance::class;
    }

    /** @param  SchemeMaintenance  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $record->mobilized_labor_male = (int) ($record->mobilized_labor_male ?? 0);
        $record->mobilized_labor_female = (int) ($record->mobilized_labor_female ?? 0);
        $record->total_mobilized_labor = $this->total($record, 'mobilized_labor_male', 'mobilized_labor_female');
    }
}
