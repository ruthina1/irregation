<?php

namespace Modules\Irrigation\Services\StudyDesign;

use App\Models\User;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Models\StudyDesign\ConstructionReadyDesign;
use Modules\Irrigation\Models\StudyDesign\DesignQualityAudit;
use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Support\EthiopianCalendar;
use Modules\Irrigation\Support\IrrigationEnums;
use Modules\Irrigation\Support\StudyDesign\ConstructionReadyDesignEnums;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

/**
 * Business rules of the construction-ready design shelf: shelf entries for
 * certified studies and their handover to the construction directorate.
 */
class ConstructionReadyDesignService extends IrrigationRecordService
{
    public function modelClass(): string
    {
        return ConstructionReadyDesign::class;
    }

    /** Put a construction-ready design on the shelf (once per study). */
    public function ensureShelfEntry(StudyDesignProject $study, ?DesignQualityAudit $audit): ConstructionReadyDesign
    {
        $shelf = ConstructionReadyDesign::query()->where('project_id', $study->id)->first();

        if (! $shelf) {
            $shelf = new ConstructionReadyDesign;
            $shelf->project_id = $study->id;
            $shelf->fiscal_year = $study->fiscal_year;
            $shelf->shelf_status = 'Available on Shelf';
            $shelf->shelf_code = $this->generateCode('SHLF', $study->fiscal_year);
            $shelf->created_by = $audit?->updated_by ?? $study->updated_by;
            foreach (ConstructionReadyDesign::definitionClass()::get()['server'] as $field => $default) {
                $shelf->setAttribute($field, $default);
            }

            $shelf->estimated_construction_etb = (float) ($study->pipeline?->estimated_budget_etb ?? 0);
            $shelf->preferred_funding_channel = IrrigationEnums::FUNDING_SOURCES[0];
            $shelf->procurement_remarks = null;
        }

        $shelf->scheme_name = $study->project_name;
        $this->copyLocation($shelf, $study);
        $shelf->project_code = $study->project_code;
        $shelf->study_modality = $study->study_modality;
        $shelf->scheme_type = $study->study_modality === 'Consultant - Existing' ? 'Existing Rehabilitation' : 'New Construction';
        $shelf->water_source = $study->water_source;
        $shelf->command_area_ha = (float) ($study->command_area_hectares ?? 0);
        $shelf->beneficiaries_male = (int) ($study->beneficiaries_male ?? 0);
        $shelf->beneficiaries_female = (int) ($study->beneficiaries_female ?? 0);

        if ($audit) {
            $checks = (array) ($audit->verification_checklist ?? []);
            $shelf->qa_certificate_no = $audit->qa_certificate_no;
            $shelf->shelf_entry_ethiopian_date = $audit->qa_ethiopian_date ?? EthiopianCalendar::todayLabel();
            $shelf->tender_dossier = [
                'engineering_drawings' => true,
                'technical_specifications' => true,
                'priced_boq' => (bool) ($checks['boq_cost_rationality'] ?? false),
                'esia_clearance' => (bool) ($checks['esia_clearance'] ?? false),
                'wua_land_agreement' => (bool) (($shelf->tender_dossier ?? [])['wua_land_agreement'] ?? false),
            ];
        } elseif (blank($shelf->shelf_entry_ethiopian_date)) {
            $shelf->shelf_entry_ethiopian_date = $study->review_ethiopian_date ?? EthiopianCalendar::todayLabel();
        }

        $shelf->save();

        return $shelf;
    }

    /**
     * Hand a shelf design over to the construction directorate for procurement.
     *
     * @param  array<string, mixed>  $input
     */
    public function handover(ConstructionReadyDesign $shelf, array $input, ?User $user): IrrigationRecord
    {
        return $this->runAction('handover', $shelf, $user, function (ConstructionReadyDesign $shelf) use ($input, $user) {
            if (in_array($shelf->shelf_status, [ConstructionReadyDesignEnums::HANDED_OVER, ConstructionReadyDesignEnums::ARCHIVED], true)) {
                throw new ConflictHttpException("This design cannot be handed over because its shelf status is \"{$shelf->shelf_status}\".");
            }

            $shelf->shelf_status = ConstructionReadyDesignEnums::HANDED_OVER;
            $shelf->handover_details = [
                'handover_date' => EthiopianCalendar::todayLabel(),
                'procurement_method' => $input['procurement_method'],
                'allocated_budget_etb' => (float) $input['allocated_budget_etb'],
                'executing_client' => $input['executing_client'],
                'handover_notes' => $input['handover_notes'] ?? null,
                'handed_over_by' => $user?->name,
            ];
            $shelf->save();
        });
    }
}
