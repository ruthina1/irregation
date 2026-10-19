<?php

namespace Modules\Irrigation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Modules\Irrigation\Support\AgriculturalInputs\InputAllocationEnums;
use Modules\Irrigation\Support\Construction\ConstructionContractEnums;
use Modules\Irrigation\Support\Construction\ConstructionProgressLogEnums;
use Modules\Irrigation\Support\Construction\FundingAllocationEnums;
use Modules\Irrigation\Support\Construction\HandoverCertificateEnums;
use Modules\Irrigation\Support\Construction\LandBenefitVerificationEnums;
use Modules\Irrigation\Support\Institutions\AssociationAuditEnums;
use Modules\Irrigation\Support\Institutions\AssociationTrainingEnums;
use Modules\Irrigation\Support\Institutions\SchemeMaintenanceEnums;
use Modules\Irrigation\Support\Institutions\WaterUsersAssociationEnums;
use Modules\Irrigation\Support\IrrigationEnums;
use Modules\Irrigation\Support\Production\HighlandWheatClusterEnums;
use Modules\Irrigation\Support\Production\SeasonalProductionEnums;
use Modules\Irrigation\Support\StudyDesign\ConstructionReadyDesignEnums;
use Modules\Irrigation\Support\StudyDesign\DesignDocumentReviewEnums;
use Modules\Irrigation\Support\StudyDesign\DesignQualityAuditEnums;
use Modules\Irrigation\Support\StudyDesign\PipelineProjectEnums;
use Modules\Irrigation\Support\StudyDesign\ProfessionalTrainingEnums;
use Modules\Irrigation\Support\StudyDesign\StudyDesignProjectEnums;
use Modules\Irrigation\Support\WaterUtilization\IrrigatedAreaEnums;
use Modules\Irrigation\Support\WaterUtilization\WaterSourceEnums;
use ReflectionClass;

/**
 * Controlled vocabularies (GET options), grouped per feature, so clients can
 * build selects from one source of truth.
 */
class IrrigationOptionsController extends Controller
{
    /**
     * @var array<string, class-string>
     */
    private const VOCABULARIES = [
        'shared' => IrrigationEnums::class,
        'pipeline_projects' => PipelineProjectEnums::class,
        'study_design_projects' => StudyDesignProjectEnums::class,
        'design_document_reviews' => DesignDocumentReviewEnums::class,
        'design_quality_audits' => DesignQualityAuditEnums::class,
        'construction_ready_designs' => ConstructionReadyDesignEnums::class,
        'professional_trainings' => ProfessionalTrainingEnums::class,
        'input_allocations' => InputAllocationEnums::class,
        'construction_contracts' => ConstructionContractEnums::class,
        'construction_progress_logs' => ConstructionProgressLogEnums::class,
        'handover_certificates' => HandoverCertificateEnums::class,
        'funding_allocations' => FundingAllocationEnums::class,
        'land_benefit_verifications' => LandBenefitVerificationEnums::class,
        'water_users_associations' => WaterUsersAssociationEnums::class,
        'association_audits' => AssociationAuditEnums::class,
        'association_trainings' => AssociationTrainingEnums::class,
        'scheme_maintenance' => SchemeMaintenanceEnums::class,
        'irrigated_areas' => IrrigatedAreaEnums::class,
        'water_sources' => WaterSourceEnums::class,
        'seasonal_productions' => SeasonalProductionEnums::class,
        'highland_wheat_clusters' => HighlandWheatClusterEnums::class,
    ];

    public function __invoke(): JsonResponse
    {
        $options = array_map(
            fn (string $class): array => (new ReflectionClass($class))->getConstants(),
            self::VOCABULARIES,
        );

        return response()->json(['data' => $options]);
    }
}
