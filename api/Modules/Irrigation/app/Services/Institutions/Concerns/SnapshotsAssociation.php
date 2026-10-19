<?php

namespace Modules\Irrigation\Services\Institutions\Concerns;

use Modules\Irrigation\Models\Institutions\WaterUsersAssociation;
use Modules\Irrigation\Models\IrrigationRecord;

/**
 * Copies identifying fields of the parent water users' association onto an
 * audit or training record, so lists can show them without joins.
 */
trait SnapshotsAssociation
{
    /** @param  list<string>  $extraColumns  further association columns to copy */
    protected function snapshotAssociation(IrrigationRecord $record, ?WaterUsersAssociation $association, array $extraColumns): void
    {
        if (! $association) {
            return;
        }

        $record->wua_name = $association->wua_name;
        $record->wua_reg_code = $association->wua_reg_code;
        $record->scheme_name = $association->scheme_name;
        $this->copyLocation($record, $association);
        foreach ($extraColumns as $column) {
            $record->setAttribute($column, $association->getAttribute($column));
        }
    }
}
