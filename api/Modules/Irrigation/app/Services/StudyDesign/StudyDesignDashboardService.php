<?php

namespace Modules\Irrigation\Services\StudyDesign;

use Modules\Irrigation\Models\StudyDesign\ConstructionReadyDesign;
use Modules\Irrigation\Models\StudyDesign\PipelineProject;
use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;
use Modules\Irrigation\Services\Reports\IrrigationReport;

/**
 * Study & Design dashboard: KPIs, stage progress, modality mix and the most
 * recent construction-ready certifications.
 */
class StudyDesignDashboardService extends IrrigationReport
{
    private const MODALITY_GROUPS = [
        'Consultant (New)' => ['Consultant - New'],
        'Consultant (Rehab)' => ['Consultant - Existing'],
        'Program-Led (FSRP/PACT)' => ['Program-Led'],
        'In-House Regional' => ['In-House Regional'],
        'In-House Zonal/Woreda' => ['In-House Zonal', 'In-House Woreda'],
    ];

    public function build(?string $fiscalYear): array
    {
        $pipeline = $this->rows(PipelineProject::class, $fiscalYear);
        $studies = $this->rows(StudyDesignProject::class, $fiscalYear);
        $shelf = $this->rows(ConstructionReadyDesign::class, $fiscalYear);

        $modality = fn (array $s) => (string) ($s['study_modality'] ?? '');
        $ready = $studies->filter(fn ($s) => ! empty($s['is_construction_ready']));
        $scouting = $pipeline->filter(fn ($p) => empty($p['promoted_to_study']) && ($p['pipeline_status'] ?? '') !== 'Infeasible / Deferred');
        $stage = fn (array $stages) => $studies->filter(fn ($s) => in_array($s['study_stage'] ?? null, $stages, true));
        $preliminary = $stage(['Preliminary Identification & Pipeline']);
        $stageRow = fn (string $label, string $stageName) => [
            'stage' => $label,
            'schemes' => $stage([$stageName])->count(),
            'area' => self::sum($stage([$stageName]), 'command_area_hectares'),
        ];

        return [
            'data' => [
                'kpis' => [
                    'pipeline_schemes' => $scouting->count(),
                    'active_studies' => $studies->count(),
                    'in_house_studies' => $studies->filter(fn ($s) => str_starts_with($modality($s), 'In-House'))->count(),
                    'consultant_studies' => $studies->filter(fn ($s) => str_starts_with($modality($s), 'Consultant'))->count(),
                    'program_studies' => $studies->filter(fn ($s) => $modality($s) === 'Program-Led')->count(),
                    'construction_ready' => $ready->count(),
                    'construction_ready_pct' => self::pct($ready->count(), $studies->count()),
                    'total_irrigable_ha' => self::sum($studies, 'command_area_hectares'),
                    'total_households' => (int) (self::sum($studies, 'beneficiaries_male') + self::sum($studies, 'beneficiaries_female')),
                ],
                'stage_progress' => [
                    [
                        'stage' => 'Pipeline Reconnaissance',
                        'schemes' => $scouting->count() + $preliminary->count(),
                        'area' => self::sum($scouting, 'potential_area_ha') + self::sum($preliminary, 'command_area_hectares'),
                    ],
                    $stageRow('Feasibility & Hydrology', 'Feasibility & Hydrology Study'),
                    $stageRow('Detailed Engineering', 'Detailed Engineering Design'),
                    $stageRow('Construction-Ready', 'Design Completed (Construction-Ready)'),
                ],
                'modality_distribution' => collect(self::MODALITY_GROUPS)->map(function ($modalities, $name) use ($studies) {
                    $group = $studies->filter(fn ($s) => in_array($s['study_modality'] ?? null, $modalities, true));

                    return ['name' => $name, 'count' => $group->count(), 'hectares' => self::sum($group, 'command_area_hectares')];
                })->values()->all(),
                'recent_certifications' => $shelf->sortByDesc('id')->take(5)->map(fn ($s) => [
                    'key' => (string) $s['id'],
                    'code' => $s['project_code'] ?? $s['shelf_code'],
                    'name' => $s['scheme_name'],
                    'modality' => $s['study_modality'],
                    'area' => (float) ($s['command_area_ha'] ?? 0),
                    'zone' => $s['zone'],
                    'qa_certificate_no' => $s['qa_certificate_no'] ?? null,
                    'shelf_status' => $s['shelf_status'],
                ])->values()->all(),
            ],
        ];
    }
}
