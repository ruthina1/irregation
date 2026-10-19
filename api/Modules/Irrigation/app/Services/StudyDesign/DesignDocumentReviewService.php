<?php

namespace Modules\Irrigation\Services\StudyDesign;

use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Models\StudyDesign\DesignDocumentReview;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Services\StudyDesign\Concerns\SnapshotsStudy;

/**
 * Business rules of design document reviews: study snapshot, disciplinary
 * checklist and the study's review status.
 */
class DesignDocumentReviewService extends IrrigationRecordService
{
    use SnapshotsStudy;

    public function modelClass(): string
    {
        return DesignDocumentReview::class;
    }

    /** @param  DesignDocumentReview  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $this->snapshotStudy($record, $record->project, ['document_source' => 'study_modality']);
        $this->checklist($record, $input, 'disciplinary_checklist', [
            'hydrology' => 'check_hydrology', 'structural' => 'check_structural',
            'geotechnical' => 'check_geotechnical', 'agronomy' => 'check_agronomy', 'esia' => 'check_esia',
        ]);
    }

    /** @param  DesignDocumentReview  $record */
    protected function afterSave(IrrigationRecord $record, ?string $previousStatus): void
    {
        app(StudyDesignProjectService::class)->syncReviewStatus($record);
    }
}
