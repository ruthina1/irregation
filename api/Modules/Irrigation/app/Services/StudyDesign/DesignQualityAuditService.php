<?php

namespace Modules\Irrigation\Services\StudyDesign;

use Illuminate\Validation\ValidationException;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Models\StudyDesign\DesignQualityAudit;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Services\StudyDesign\Concerns\SnapshotsStudy;
use Modules\Irrigation\Support\StudyDesign\DesignQualityAuditEnums;
use Modules\Irrigation\Support\StudyDesign\ReviewVerdict;

/**
 * Business rules of design quality-assurance audits: the linked review
 * snapshot, verification checklist and certification of the study.
 */
class DesignQualityAuditService extends IrrigationRecordService
{
    use SnapshotsStudy;

    public function modelClass(): string
    {
        return DesignQualityAudit::class;
    }

    /** @param  DesignQualityAudit  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $this->snapshotStudy($record, $record->project, ['study_modality' => 'study_modality']);

        $review = $record->project_id ? app(StudyDesignProjectService::class)->latestReview($record->project_id) : null;
        $record->linked_review_code = $review?->review_code ?? 'Pending Review';
        $record->review_verdict_snapshot = $review?->review_verdict ?? 'Under Review';
        $record->review_score_snapshot = (int) ($review?->overall_technical_score ?? 0);
        $record->review_cleared = ReviewVerdict::isApproved($review?->review_verdict);

        $this->checklist($record, $input, 'verification_checklist', [
            'hydrology_safety' => 'check_hydrology', 'structural_stability' => 'check_structural',
            'geotech_foundation' => 'check_geotech', 'seepage_cutoff' => 'check_seepage',
            'boq_cost_rationality' => 'check_boq', 'esia_clearance' => 'check_esia',
        ]);

        if ($record->qa_status === DesignQualityAuditEnums::CERTIFIED && ! $record->review_cleared) {
            throw ValidationException::withMessages([
                'qa_status' => 'QA certification requires an approved design document review for this project.',
            ]);
        }
    }

    /** @param  DesignQualityAudit  $record */
    protected function afterSave(IrrigationRecord $record, ?string $previousStatus): void
    {
        if ($record->qa_status === DesignQualityAuditEnums::CERTIFIED && $previousStatus !== DesignQualityAuditEnums::CERTIFIED) {
            app(StudyDesignProjectService::class)->certify($record);
        }
    }
}
