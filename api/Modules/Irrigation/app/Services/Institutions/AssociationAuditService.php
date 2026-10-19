<?php

namespace Modules\Irrigation\Services\Institutions;

use Modules\Irrigation\Models\Institutions\AssociationAudit;
use Modules\Irrigation\Models\Institutions\WaterUsersAssociation;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Services\Institutions\Concerns\SnapshotsAssociation;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Support\Institutions\AssociationAuditEnums;

/**
 * Business rules of WUA strengthening audits: association snapshot,
 * compliance checklist and the yearly audit history.
 */
class AssociationAuditService extends IrrigationRecordService
{
    use SnapshotsAssociation;

    public function modelClass(): string
    {
        return AssociationAudit::class;
    }

    /** @param  AssociationAudit  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $this->snapshotAssociation($record, $record->association, ['command_area_ha', 'total_members']);
        $this->checklist($record, $input, 'compliance_checklist', [
            'annual_general_assembly_held' => 'check_assembly', 'bank_reconciliation_verified' => 'check_bank',
            'water_fee_receipts_audited' => 'check_receipts', 'by_laws_enforced' => 'check_bylaws',
            'dispute_resolution_active' => 'check_disputes', 'asset_register_updated' => 'check_assets',
        ]);
    }

    /**
     * Before a new yearly audit is recorded, move the current result into the
     * audit history (newest first, one entry per fiscal year).
     *
     * @param  AssociationAudit  $record
     */
    protected function beforeUpdate(IrrigationRecord $record, array $input): void
    {
        if (blank($input['audit_verdict'] ?? null)
            || $record->audit_verdict === AssociationAuditEnums::IN_PROGRESS
            || blank($record->audit_verdict)) {
            return;
        }

        $entry = [
            'year' => $record->fiscal_year,
            'verdict' => $record->audit_verdict,
            'score' => (int) ($record->overall_health_score ?? 0),
            'auditor' => $record->lead_auditor,
        ];

        $history = array_values(array_filter(
            (array) ($record->audit_history ?? []),
            fn ($h) => ($h['year'] ?? null) !== $entry['year'],
        ));
        array_unshift($history, $entry);

        $record->audit_history = $history;
    }

    public function createPending(WaterUsersAssociation $association): AssociationAudit
    {
        $audit = new AssociationAudit;
        $audit->wua_id = $association->id;
        $audit->fiscal_year = $association->fiscal_year;
        $audit->audit_verdict = AssociationAuditEnums::IN_PROGRESS;
        $audit->created_by = $association->created_by;
        $audit->updated_by = $association->updated_by;
        $audit->audit_code = $this->generateCode('AUD', $association->fiscal_year);
        foreach (AssociationAudit::definitionClass()::get()['server'] as $field => $default) {
            $audit->setAttribute($field, $default);
        }
        $audit->governance_grade = null;
        $audit->overall_health_score = null;
        $this->compute($audit, [], creating: true);
        $audit->save();

        return $audit;
    }

    public function refreshSnapshot(AssociationAudit $audit): void
    {
        $this->compute($audit, [], creating: false);
        $audit->save();
    }
}
