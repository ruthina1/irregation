<?php

namespace Modules\Irrigation\Services\AgriculturalInputs;

use App\Models\User;
use Illuminate\Support\Str;
use Modules\Irrigation\Models\AgriculturalInputs\InputAllocation;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Support\EthiopianCalendar;

/**
 * Business rules of agricultural input allocations: dispatches to farmers and
 * the allocation status derived from the distributed quantity.
 */
class InputAllocationService extends IrrigationRecordService
{
    public function modelClass(): string
    {
        return InputAllocation::class;
    }

    /** @param  InputAllocation  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $record->item_name = $record->input_name;
        $record->total_beneficiaries = $this->total($record, 'beneficiaries_male', 'beneficiaries_female');
        $record->status = self::statusFor($this->number($record, 'distributed_qty'), $this->number($record, 'planned_target_qty'));
    }

    public static function statusFor(float $distributed, float $planned): string
    {
        return match (true) {
            $distributed <= 0 => 'Pending',
            $planned > 0 && $distributed >= $planned => 'Completed',
            default => 'In Progress',
        };
    }

    /**
     * Record a dispatch of an input allocation to farmers / a cooperative.
     *
     * @param  array<string, mixed>  $input
     */
    public function dispatch(InputAllocation $allocation, array $input, ?User $user): IrrigationRecord
    {
        return $this->runAction('dispatch', $allocation, $user, function (InputAllocation $allocation) use ($input, $user) {
            $qty = round((float) $input['dispatch_qty'], 3);
            $history = (array) ($allocation->dispatch_history ?? []);
            array_unshift($history, [
                'id' => (string) Str::uuid(),
                'qty' => $qty,
                'ethiopian_date' => EthiopianCalendar::format($input['eth_month'], $input['eth_day'], $input['eth_year']),
                'recipient' => $input['recipient'],
                'notes' => $input['notes'] ?? '',
                'recorded_by' => $user?->name,
            ]);

            $allocation->dispatch_history = $history;
            $allocation->distributed_qty = $this->number($allocation, 'distributed_qty') + $qty;
            $this->fill($allocation, [], creating: false);
        });
    }
}
