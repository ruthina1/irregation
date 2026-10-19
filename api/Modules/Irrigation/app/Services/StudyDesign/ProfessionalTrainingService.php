<?php

namespace Modules\Irrigation\Services\StudyDesign;

use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Models\StudyDesign\ProfessionalTraining;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Business rules of professional capacity-building trainings.
 */
class ProfessionalTrainingService extends IrrigationRecordService
{
    public function modelClass(): string
    {
        return ProfessionalTraining::class;
    }

    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $record->total_participants = $this->total($record, 'male_participants', 'female_participants');
    }
}
