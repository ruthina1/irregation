<?php

namespace Modules\Irrigation\Services\Institutions;

use Modules\Irrigation\Models\Institutions\WaterUsersAssociation;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Business rules of water users' associations: membership totals, the
 * pending strengthening audit opened for every new association, and keeping
 * the association details on its audits and trainings in step.
 */
class WaterUsersAssociationService extends IrrigationRecordService
{
    public function __construct(
        private readonly AssociationAuditService $audits,
        private readonly AssociationTrainingService $trainings,
    ) {}

    public function modelClass(): string
    {
        return WaterUsersAssociation::class;
    }

    protected function blockingRelations(): array
    {
        return ['trainings' => 'WUA capacity-building training'];
    }

    protected function ownedRelations(): array
    {
        return ['audits'];
    }

    /** @param  WaterUsersAssociation  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $record->total_members = $this->total($record, 'members_male', 'members_female');
        $record->committee_members_count = $this->total($record, 'committee_male', 'committee_female');
        $record->project_code = $record->contract_code;
    }

    /**
     * The strengthening-audit page has no create form: every association gets
     * a pending audit when it is registered.
     *
     * @param  WaterUsersAssociation  $record
     */
    protected function afterCreate(IrrigationRecord $record): void
    {
        $this->audits->createPending($record);
    }

    /** @param  WaterUsersAssociation  $record */
    protected function afterSave(IrrigationRecord $record, ?string $previousStatus): void
    {
        $record->audits()->get()->each(fn ($audit) => $this->audits->refreshSnapshot($audit));
        $record->trainings()->get()->each(fn ($training) => $this->trainings->refreshSnapshot($training));
    }
}
