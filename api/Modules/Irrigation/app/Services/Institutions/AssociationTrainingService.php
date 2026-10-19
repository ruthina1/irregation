<?php

namespace Modules\Irrigation\Services\Institutions;

use Modules\Irrigation\Models\Institutions\AssociationTraining;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Services\Institutions\Concerns\SnapshotsAssociation;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Business rules of WUA capacity-building trainings.
 */
class AssociationTrainingService extends IrrigationRecordService
{
    use SnapshotsAssociation;

    public function modelClass(): string
    {
        return AssociationTraining::class;
    }

    /** @param  AssociationTraining  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $this->snapshotAssociation($record, $record->association, ['project_code']);
        $record->total_trainees = $this->total($record, 'exec_leaders_male', 'exec_leaders_female', 'members_male', 'members_female');
    }

    public function refreshSnapshot(AssociationTraining $training): void
    {
        $this->compute($training, [], creating: false);
        $training->save();
    }
}
