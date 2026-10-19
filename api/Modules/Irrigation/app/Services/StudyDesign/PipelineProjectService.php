<?php

namespace Modules\Irrigation\Services\StudyDesign;

use App\Models\User;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Models\StudyDesign\PipelineProject;
use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Support\EthiopianCalendar;
use Modules\Irrigation\Support\StudyDesign\PipelineProjectEnums;
use Modules\Irrigation\Support\StudyDesign\StudyDesignProjectEnums;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

/**
 * Business rules of pipeline projects: reconnaissance screening and promotion
 * to a study-design project.
 */
class PipelineProjectService extends IrrigationRecordService
{
    public function __construct(private readonly StudyDesignProjectService $studies) {}

    public function modelClass(): string
    {
        return PipelineProject::class;
    }

    protected function blockingRelations(): array
    {
        return ['studies' => 'Study & design project'];
    }

    /**
     * Record a reconnaissance/screening decision. Only projects approved for
     * detailed study can be promoted; promotion opens a study-design project
     * prefilled from the pipeline record.
     *
     * @param  array<string, mixed>  $input
     */
    public function screen(PipelineProject $pipeline, array $input, ?User $user): IrrigationRecord
    {
        return $this->runAction('screening', $pipeline, $user, function (PipelineProject $pipeline) use ($input, $user) {
            $approved = $input['pipeline_status'] === PipelineProjectEnums::APPROVED;
            $alreadyPromoted = (bool) $pipeline->promoted_study_id;

            if ($alreadyPromoted && ! $approved) {
                throw new ConflictHttpException('This pipeline project has already been promoted to a study-design project; its approval cannot be withdrawn.');
            }

            $pipeline->pipeline_status = $input['pipeline_status'];
            $pipeline->reconnaissance_expert = $input['reconnaissance_expert'];
            $pipeline->reconnaissance_ethiopian_date = EthiopianCalendar::format($input['eth_month'], $input['eth_day'], $input['eth_year']);
            if (filled($input['site_notes'] ?? null)) {
                $pipeline->site_notes = $input['site_notes'];
            }
            $pipeline->promoted_to_study = $alreadyPromoted || ($approved && (bool) $input['promoted_to_study']);
            $pipeline->save();

            if ($pipeline->promoted_to_study && ! $alreadyPromoted) {
                $study = $this->promote($pipeline, $user);
                $pipeline->promoted_study_id = $study->id;
                $pipeline->save();
            }
        });
    }

    private function promote(PipelineProject $pipeline, ?User $user): StudyDesignProject
    {
        /** @var StudyDesignProject $study */
        $study = $this->studies->create([
            'project_code' => $this->uniqueStudyCode($pipeline->pipeline_code),
            'project_name' => $pipeline->scheme_name,
            'study_modality' => 'Consultant - New',
            'study_stage' => 'Feasibility & Hydrology Study',
            'water_source' => $this->studyWaterSource((string) $pipeline->water_source),
            'lead_consultant_or_office' => 'To Be Assigned',
            'command_area_hectares' => $pipeline->potential_area_ha ?? 0,
            'beneficiaries_male' => $pipeline->estimated_beneficiaries_male ?? 0,
            'beneficiaries_female' => $pipeline->estimated_beneficiaries_female ?? 0,
            'experts_trained_male' => 0,
            'experts_trained_female' => 0,
            'is_construction_ready' => false,
            'fiscal_year' => $pipeline->fiscal_year,
            'zone' => $pipeline->zone, 'woreda' => $pipeline->woreda, 'kebele' => $pipeline->kebele,
            'zone_id' => $pipeline->zone_id, 'woreda_id' => $pipeline->woreda_id, 'kebele_id' => $pipeline->kebele_id,
        ], $user);

        $study->pipeline_id = $pipeline->id;
        $study->pipeline_code = $pipeline->pipeline_code;
        $study->save();

        return $study;
    }

    private function uniqueStudyCode(?string $pipelineCode): string
    {
        $base = 'STD-'.preg_replace('/^PLN-/', '', (string) $pipelineCode);
        $code = $base;
        for ($i = 2; StudyDesignProject::query()->where('project_code', $code)->exists(); $i++) {
            $code = $base.'-'.$i;
        }

        return $code;
    }

    /** Pipeline and study pages use parallel water-source lists with slightly different labels. */
    private function studyWaterSource(string $pipelineSource): string
    {
        $index = array_search($pipelineSource, PipelineProjectEnums::WATER_SOURCES, true);

        return StudyDesignProjectEnums::WATER_SOURCES[$index === false ? 0 : $index];
    }
}
