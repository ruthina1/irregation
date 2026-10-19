<?php

namespace Modules\Irrigation\Services\Construction;

use Modules\Irrigation\Models\Construction\ConstructionProgressLog;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Support\Construction\ConstructionContractEnums;
use Modules\Irrigation\Support\Construction\ConstructionWbs;

/**
 * Business rules of construction progress logs: contract snapshot, schedule
 * variance and keeping the contract's current progress up to date.
 */
class ConstructionProgressLogService extends IrrigationRecordService
{
    public function modelClass(): string
    {
        return ConstructionProgressLog::class;
    }

    /** @param  ConstructionProgressLog  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $contract = $record->contract;
        if ($contract) {
            foreach (['project_code', 'scheme_type', 'contract_sum_etb', 'command_area_ha', 'disbursed_sum_etb', 'contract_code', 'scheme_name'] as $field) {
                $record->setAttribute($field, $contract->getAttribute($field));
            }
            $this->copyLocation($record, $contract);
        }

        $variance = round($this->number($record, 'physical_progress_pct') - $this->number($record, 'planned_progress_pct'), 2);
        $record->variance_pct = $variance;
        if ($creating) {
            $record->health_status = match (true) {
                $variance < -15 => 'Critical Delay',
                $variance < -5 => 'Minor Delay',
                $variance >= 5 => 'Ahead of Schedule',
                default => 'On Track',
            };
        }
    }

    /**
     * The newest progress log becomes the contract's current progress.
     *
     * @param  ConstructionProgressLog  $record
     */
    protected function afterSave(IrrigationRecord $record, ?string $previousStatus): void
    {
        $contract = $record->contract;
        if (! $contract) {
            return;
        }

        $latest = ConstructionProgressLog::query()->where('contract_id', $contract->id)->latest()->orderByDesc('id')->first();
        if (! $latest || $latest->id !== $record->id) {
            return;
        }

        foreach ([...ConstructionWbs::PROGRESS_FIELDS, 'reporting_ethiopian_date'] as $field) {
            $contract->setAttribute($field, $record->getAttribute($field));
        }
        if (in_array($record->health_status, ConstructionContractEnums::HEALTH_STATUSES, true)) {
            $contract->health_status = $record->health_status;
        }
        $contract->save();
    }
}
