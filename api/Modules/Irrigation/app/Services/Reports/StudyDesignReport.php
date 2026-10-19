<?php

namespace Modules\Irrigation\Services\Reports;

use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;
use Modules\Irrigation\Support\StudyDesign\StudyDesignProjectEnums;

/**
 * Study & design report: studies, modalities and review/QA outcomes per zone.
 */
class StudyDesignReport extends IrrigationReport
{
    public function build(?string $fiscalYear): array
    {
        $studies = $this->rows(StudyDesignProject::class, $fiscalYear);

        $rows = array_map(function ($zone) use ($studies) {
            $z = self::byZone($studies, $zone);
            $inHouse = $z->filter(fn ($s) => str_starts_with((string) ($s['study_modality'] ?? ''), 'In-House'))->count();

            return [
                'zone' => $zone,
                'total_pipeline' => $z->count(),
                'consultant_studies' => $z->count() - $inHouse,
                'inhouse_studies' => $inHouse,
                'command_area_ha' => self::sum($z, 'command_area_hectares'),
                'beneficiaries_male' => (int) self::sum($z, 'beneficiaries_male'),
                'beneficiaries_female' => (int) self::sum($z, 'beneficiaries_female'),
                'reviewed_count' => $z->filter(fn ($s) => ($s['review_status'] ?? '') === 'Reviewed & Verified')->count(),
                'qa_passed_count' => $z->filter(fn ($s) => ($s['qa_status'] ?? '') === StudyDesignProjectEnums::QA_PASSED)->count(),
                'construction_ready_count' => $z->filter(fn ($s) => ! empty($s['is_construction_ready']))->count(),
                'experts_trained_male' => (int) self::sum($z, 'experts_trained_male'),
                'experts_trained_female' => (int) self::sum($z, 'experts_trained_female'),
            ];
        }, self::zones($studies));

        return ['data' => self::withKeys($rows)];
    }
}
