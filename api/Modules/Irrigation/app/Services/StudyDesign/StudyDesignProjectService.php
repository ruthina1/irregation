<?php

namespace Modules\Irrigation\Services\StudyDesign;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Models\StudyDesign\DesignDocumentReview;
use Modules\Irrigation\Models\StudyDesign\DesignQualityAudit;
use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Support\EthiopianCalendar;
use Modules\Irrigation\Support\StudyDesign\ReviewVerdict;
use Modules\Irrigation\Support\StudyDesign\StudyDesignProjectEnums;

/**
 * Business rules of study & design projects: review/QA decisions,
 * certification and the latest document-review outcome shown with each study.
 */
class StudyDesignProjectService extends IrrigationRecordService
{
    public function __construct(private readonly ConstructionReadyDesignService $shelf) {}

    public function modelClass(): string
    {
        return StudyDesignProject::class;
    }

    protected function blockingRelations(): array
    {
        return [
            'documentReviews' => 'Design document review',
            'qualityAudits' => 'Design quality-assurance audit',
            'shelfEntries' => 'Construction-ready design',
        ];
    }

    /** Study rows carry the outcome of their latest design document review. */
    protected function presentationExtras(Collection $records): array
    {
        $reviews = DesignDocumentReview::query()
            ->whereIn('project_id', $records->pluck('id'))
            ->orderBy('created_at')->orderBy('id')
            ->get()->keyBy('project_id'); // later rows overwrite earlier ones → latest per study

        $extras = [];
        foreach ($records as $study) {
            $review = $reviews->get($study->id);
            $extras[$study->id] = [
                'latest_review_code' => $review?->review_code,
                'latest_review_verdict' => $review?->review_verdict,
                'latest_review_score' => $review?->overall_technical_score,
                'review_cleared' => ReviewVerdict::isApproved($review?->review_verdict),
            ];
        }

        return $extras;
    }

    public function latestReview(int $studyId): ?DesignDocumentReview
    {
        return DesignDocumentReview::query()->where('project_id', $studyId)->latest()->orderByDesc('id')->first();
    }

    /**
     * Record the multi-disciplinary review and QA outcome of a study. A design
     * can only be flagged construction-ready once it is quality-assured.
     *
     * @param  array<string, mixed>  $input
     */
    public function reviewQa(StudyDesignProject $study, array $input, ?User $user): IrrigationRecord
    {
        if ($input['is_construction_ready'] && $input['qa_status'] !== StudyDesignProjectEnums::QA_PASSED) {
            throw ValidationException::withMessages([
                'is_construction_ready' => 'A design can only be marked construction-ready after it is Quality Assured (Certified Passed).',
            ]);
        }

        return $this->runAction('review-qa', $study, $user, function (StudyDesignProject $study) use ($input) {
            $study->review_status = $input['review_status'];
            $study->qa_status = $input['qa_status'];
            $study->is_construction_ready = (bool) $input['is_construction_ready'];
            $study->reviewed_by = $input['reviewer_expert'];
            $study->review_ethiopian_date = EthiopianCalendar::format($input['eth_month'], $input['eth_day'], $input['eth_year']);
            if (filled($input['review_notes'] ?? null)) {
                $study->review_notes = $input['review_notes'];
            }
            $study->save();

            if ($study->is_construction_ready) {
                $this->shelf->ensureShelfEntry($study, null);
            }
        });
    }

    /** Called when a QA audit is certified: the study becomes construction-ready. */
    public function certify(DesignQualityAudit $audit): void
    {
        $study = $audit->project;
        if (! $study) {
            return;
        }

        $study->qa_status = StudyDesignProjectEnums::QA_PASSED;
        $study->is_construction_ready = true;
        $study->save();

        $this->shelf->ensureShelfEntry($study, $audit);
    }

    /** A design document review verdict moves the study's review status. */
    public function syncReviewStatus(DesignDocumentReview $review): void
    {
        $study = $review->project;
        if (! $study) {
            return;
        }

        $latest = $this->latestReview($study->id);
        if (! $latest || $latest->id !== $review->id) {
            return;
        }

        $study->review_status = match (true) {
            ReviewVerdict::isApproved($review->review_verdict) => 'Reviewed & Verified',
            ReviewVerdict::requiresRevision($review->review_verdict) => 'Revisions Required',
            default => 'Under Multi-Disciplinary Review',
        };
        $study->save();
    }
}
