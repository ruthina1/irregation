<?php

namespace Modules\Irrigation\Tests\Feature;

use Modules\Irrigation\Support\AgriculturalInputs\InputAllocationDefinition;
use Modules\Irrigation\Support\Construction\ConstructionContractDefinition;
use Modules\Irrigation\Support\Construction\ConstructionProgressLogDefinition;
use Modules\Irrigation\Support\Construction\FundingAllocationDefinition;
use Modules\Irrigation\Support\Construction\HandoverCertificateDefinition;
use Modules\Irrigation\Support\Construction\LandBenefitVerificationDefinition;
use Modules\Irrigation\Support\Institutions\AssociationAuditDefinition;
use Modules\Irrigation\Support\Institutions\AssociationTrainingDefinition;
use Modules\Irrigation\Support\Institutions\SchemeMaintenanceDefinition;
use Modules\Irrigation\Support\Institutions\WaterUsersAssociationDefinition;
use Modules\Irrigation\Support\IrrigationDefinition;
use Modules\Irrigation\Support\Production\HighlandWheatClusterDefinition;
use Modules\Irrigation\Support\Production\SeasonalProductionDefinition;
use Modules\Irrigation\Support\StudyDesign\ConstructionReadyDesignDefinition;
use Modules\Irrigation\Support\StudyDesign\DesignDocumentReviewDefinition;
use Modules\Irrigation\Support\StudyDesign\DesignQualityAuditDefinition;
use Modules\Irrigation\Support\StudyDesign\PipelineProjectDefinition;
use Modules\Irrigation\Support\StudyDesign\ProfessionalTrainingDefinition;
use Modules\Irrigation\Support\StudyDesign\StudyDesignProjectDefinition;
use Modules\Irrigation\Support\WaterUtilization\IrrigatedAreaDefinition;
use Modules\Irrigation\Support\WaterUtilization\WaterSourceDefinition;

/**
 * API path of each Irrigation feature and its field definition.
 */
final class IrrigationFeatures
{
    /** @var array<string, class-string<IrrigationDefinition>> */
    public const DEFINITIONS = [
        'pipeline' => PipelineProjectDefinition::class,
        'study-design' => StudyDesignProjectDefinition::class,
        'document-review' => DesignDocumentReviewDefinition::class,
        'quality-assurance' => DesignQualityAuditDefinition::class,
        'construction-ready' => ConstructionReadyDesignDefinition::class,
        'capacity-building' => ProfessionalTrainingDefinition::class,
        'inputs' => InputAllocationDefinition::class,
        'construction/projects' => ConstructionContractDefinition::class,
        'construction/progress' => ConstructionProgressLogDefinition::class,
        'construction/completion' => HandoverCertificateDefinition::class,
        'construction/funding' => FundingAllocationDefinition::class,
        'construction/benefits' => LandBenefitVerificationDefinition::class,
        'institutions/water-users-associations' => WaterUsersAssociationDefinition::class,
        'institutions/assessment-audit' => AssociationAuditDefinition::class,
        'institutions/capacity-building' => AssociationTrainingDefinition::class,
        'institutions/maintenance-cleaning' => SchemeMaintenanceDefinition::class,
        'water-utilization/irrigated-area' => IrrigatedAreaDefinition::class,
        'water-utilization/water-sources' => WaterSourceDefinition::class,
        'production/seasonal-production' => SeasonalProductionDefinition::class,
        'production/highland-wheat' => HighlandWheatClusterDefinition::class,
    ];

    /** @return array<string, mixed> */
    public static function definition(string $path): array
    {
        return self::DEFINITIONS[$path]::get();
    }
}
