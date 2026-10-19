<?php

namespace Modules\Irrigation\Services\StudyDesign\Concerns;

use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;

/**
 * Copies identifying fields of the parent study-design project onto a review
 * or QA record, so lists can show them without joins.
 */
trait SnapshotsStudy
{
    /** @param  array<string, string>  $map  target column => study column */
    protected function snapshotStudy(IrrigationRecord $record, ?StudyDesignProject $study, array $map): void
    {
        if (! $study) {
            return;
        }

        $record->project_code = $study->project_code;
        $record->scheme_name = $study->project_name;
        foreach ($map as $target => $source) {
            $record->setAttribute($target, $study->getAttribute($source));
        }
        $this->copyLocation($record, $study);
    }
}
