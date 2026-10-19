<?php

namespace Modules\Irrigation\Services\Construction;

use Modules\Irrigation\Models\Construction\LandBenefitVerification;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Business rules of developed land & beneficiary verifications.
 */
class LandBenefitVerificationService extends IrrigationRecordService
{
    public function modelClass(): string
    {
        return LandBenefitVerification::class;
    }

    /** @param  LandBenefitVerification  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $planned = $this->number($record, 'planned_command_ha');
        $rate = $planned > 0 ? min(100, round($this->number($record, 'actual_developed_ha') / $planned * 100)) : 0;

        $record->land_development_rate_pct = $rate;
        $record->total_beneficiaries = $this->total($record, 'beneficiaries_male', 'beneficiaries_female');
        if ($creating && blank($input['benefit_status'] ?? null)) {
            $record->benefit_status = match (true) {
                $rate >= 95 => 'Fully Operational',
                $rate >= 40 => 'Partially Irrigated',
                default => 'Command Developed (Pre-Watering)',
            };
        }
    }
}
