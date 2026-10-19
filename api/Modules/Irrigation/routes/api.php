<?php

use Illuminate\Support\Facades\Route;

// Agricultural Inputs
use Modules\Irrigation\Http\Controllers\AgriculturalInputs\InputAllocationController;
use Modules\Irrigation\Http\Controllers\AgriculturalInputs\InputAllocationDispatchController;

// Construction & Monitoring
use Modules\Irrigation\Http\Controllers\Construction\ConstructionContractController;
use Modules\Irrigation\Http\Controllers\Construction\ConstructionContractProgressController;
use Modules\Irrigation\Http\Controllers\Construction\ConstructionProgressLogController;
use Modules\Irrigation\Http\Controllers\Construction\FundingAllocationController;
use Modules\Irrigation\Http\Controllers\Construction\FundingDisbursementController;
use Modules\Irrigation\Http\Controllers\Construction\HandoverCertificateController;
use Modules\Irrigation\Http\Controllers\Construction\LandBenefitVerificationController;

// Institutions Management
use Modules\Irrigation\Http\Controllers\Institutions\AssociationAuditController;
use Modules\Irrigation\Http\Controllers\Institutions\AssociationTrainingController;
use Modules\Irrigation\Http\Controllers\Institutions\SchemeMaintenanceController;
use Modules\Irrigation\Http\Controllers\Institutions\WaterUsersAssociationController;

// Options & Common
use Modules\Irrigation\Http\Controllers\IrrigationOptionsController;

// Crop Production & Yield
use Modules\Irrigation\Http\Controllers\Production\HighlandWheatClusterController;
use Modules\Irrigation\Http\Controllers\Production\ProductionOverviewController;
use Modules\Irrigation\Http\Controllers\Production\SeasonalProductionController;

// Reports
use Modules\Irrigation\Http\Controllers\Reports\IrrigationReportController;

// Study & Design
use Modules\Irrigation\Http\Controllers\StudyDesign\ConstructionReadyDesignController;
use Modules\Irrigation\Http\Controllers\StudyDesign\ConstructionReadyHandoverController;
use Modules\Irrigation\Http\Controllers\StudyDesign\DesignDocumentReviewController;
use Modules\Irrigation\Http\Controllers\StudyDesign\DesignQualityAuditController;
use Modules\Irrigation\Http\Controllers\StudyDesign\PipelineProjectController;
use Modules\Irrigation\Http\Controllers\StudyDesign\PipelineScreeningController;
use Modules\Irrigation\Http\Controllers\StudyDesign\ProfessionalTrainingController;
use Modules\Irrigation\Http\Controllers\StudyDesign\StudyDesignDashboardController;
use Modules\Irrigation\Http\Controllers\StudyDesign\StudyDesignProjectController;
use Modules\Irrigation\Http\Controllers\StudyDesign\StudyDesignReviewQaController;

// Water Utilization
use Modules\Irrigation\Http\Controllers\WaterUtilization\IrrigatedAreaController;
use Modules\Irrigation\Http\Controllers\WaterUtilization\WaterSourceController;

/*
|--------------------------------------------------------------------------
| Irrigation Module API Routes (Prefix: /api/v1/irrigation)
|--------------------------------------------------------------------------
| Detail-segmented route definitions independently matching standard REST
| verbs (get, post, put, delete, patch) and dedicated action controllers.
*/

Route::middleware(['auth:sanctum'])->group(function () {
    Route::middleware(['permission:manage-watersheds'])->group(function () {

        // =========================================================================
        // COMMON & OPTIONS
        // =========================================================================
        Route::get('options', IrrigationOptionsController::class)->name('options');


// =========================================================================
// 1. IRRIGATION STUDY & DESIGN
// =========================================================================

// Study Design Dashboard
Route::get('study-design/dashboard', StudyDesignDashboardController::class)->name('study-design.dashboard');

// Pipeline Projects
Route::get('pipeline', [PipelineProjectController::class, 'index'])->name('pipeline.index');
Route::post('pipeline', [PipelineProjectController::class, 'store'])->name('pipeline.store');
Route::get('pipeline/{id}', [PipelineProjectController::class, 'show'])->whereNumber('id')->name('pipeline.show');
Route::put('pipeline/{id}', [PipelineProjectController::class, 'update'])->whereNumber('id')->name('pipeline.update');
Route::patch('pipeline/{id}', [PipelineProjectController::class, 'update'])->whereNumber('id');
Route::delete('pipeline/{id}', [PipelineProjectController::class, 'destroy'])->whereNumber('id')->name('pipeline.destroy');
Route::patch('pipeline/{id}/screening', [PipelineScreeningController::class, 'processScreening'])->whereNumber('id')->name('pipeline.screening');

// Study & Design Projects
Route::get('study-design', [StudyDesignProjectController::class, 'index'])->name('study-design.index');
Route::post('study-design', [StudyDesignProjectController::class, 'store'])->name('study-design.store');
Route::get('study-design/{id}', [StudyDesignProjectController::class, 'show'])->whereNumber('id')->name('study-design.show');
Route::put('study-design/{id}', [StudyDesignProjectController::class, 'update'])->whereNumber('id')->name('study-design.update');
Route::patch('study-design/{id}', [StudyDesignProjectController::class, 'update'])->whereNumber('id');
Route::delete('study-design/{id}', [StudyDesignProjectController::class, 'destroy'])->whereNumber('id')->name('study-design.destroy');
Route::patch('study-design/{id}/review-qa', [StudyDesignReviewQaController::class, 'processReviewQa'])->whereNumber('id')->name('study-design.review-qa');

// Design Document Review
Route::get('document-review', [DesignDocumentReviewController::class, 'index'])->name('document-review.index');
Route::post('document-review', [DesignDocumentReviewController::class, 'store'])->name('document-review.store');
Route::get('document-review/{id}', [DesignDocumentReviewController::class, 'show'])->whereNumber('id')->name('document-review.show');
Route::put('document-review/{id}', [DesignDocumentReviewController::class, 'update'])->whereNumber('id')->name('document-review.update');
Route::patch('document-review/{id}', [DesignDocumentReviewController::class, 'update'])->whereNumber('id');
Route::delete('document-review/{id}', [DesignDocumentReviewController::class, 'destroy'])->whereNumber('id')->name('document-review.destroy');

// Design Quality Audit
Route::get('quality-assurance', [DesignQualityAuditController::class, 'index'])->name('quality-assurance.index');
Route::post('quality-assurance', [DesignQualityAuditController::class, 'store'])->name('quality-assurance.store');
Route::get('quality-assurance/{id}', [DesignQualityAuditController::class, 'show'])->whereNumber('id')->name('quality-assurance.show');
Route::put('quality-assurance/{id}', [DesignQualityAuditController::class, 'update'])->whereNumber('id')->name('quality-assurance.update');
Route::patch('quality-assurance/{id}', [DesignQualityAuditController::class, 'update'])->whereNumber('id');
Route::delete('quality-assurance/{id}', [DesignQualityAuditController::class, 'destroy'])->whereNumber('id')->name('quality-assurance.destroy');

// Construction-Ready Designs
Route::get('construction-ready', [ConstructionReadyDesignController::class, 'index'])->name('construction-ready.index');
Route::get('construction-ready/{id}', [ConstructionReadyDesignController::class, 'show'])->whereNumber('id')->name('construction-ready.show');
Route::put('construction-ready/{id}', [ConstructionReadyDesignController::class, 'update'])->whereNumber('id')->name('construction-ready.update');
Route::patch('construction-ready/{id}', [ConstructionReadyDesignController::class, 'update'])->whereNumber('id');
Route::post('construction-ready/{id}/handover', [ConstructionReadyHandoverController::class, 'processHandover'])->whereNumber('id')->name('construction-ready.handover');

// Professional Training (Capacity Building)
Route::get('capacity-building', [ProfessionalTrainingController::class, 'index'])->name('capacity-building.index');
Route::post('capacity-building', [ProfessionalTrainingController::class, 'store'])->name('capacity-building.store');
Route::get('capacity-building/{id}', [ProfessionalTrainingController::class, 'show'])->whereNumber('id')->name('capacity-building.show');
Route::put('capacity-building/{id}', [ProfessionalTrainingController::class, 'update'])->whereNumber('id')->name('capacity-building.update');
Route::patch('capacity-building/{id}', [ProfessionalTrainingController::class, 'update'])->whereNumber('id');
Route::delete('capacity-building/{id}', [ProfessionalTrainingController::class, 'destroy'])->whereNumber('id')->name('capacity-building.destroy');


// =========================================================================
// AGRICULTURAL INPUT UTILIZATION
// =========================================================================
Route::get('inputs', [InputAllocationController::class, 'index'])->name('inputs.index');
Route::post('inputs', [InputAllocationController::class, 'store'])->name('inputs.store');
Route::get('inputs/{id}', [InputAllocationController::class, 'show'])->whereNumber('id')->name('inputs.show');
Route::put('inputs/{id}', [InputAllocationController::class, 'update'])->whereNumber('id')->name('inputs.update');
Route::patch('inputs/{id}', [InputAllocationController::class, 'update'])->whereNumber('id');
Route::delete('inputs/{id}', [InputAllocationController::class, 'destroy'])->whereNumber('id')->name('inputs.destroy');
Route::post('inputs/{id}/dispatch', [InputAllocationDispatchController::class, 'processDispatch'])->whereNumber('id')->name('inputs.dispatch');


// =========================================================================
// 2. IRRIGATION CONSTRUCTION & MONITORING
// =========================================================================

// Construction Contracts / Projects
Route::get('construction/projects', [ConstructionContractController::class, 'index'])->name('construction.projects.index');
Route::post('construction/projects', [ConstructionContractController::class, 'store'])->name('construction.projects.store');
Route::get('construction/projects/{id}', [ConstructionContractController::class, 'show'])->whereNumber('id')->name('construction.projects.show');
Route::put('construction/projects/{id}', [ConstructionContractController::class, 'update'])->whereNumber('id')->name('construction.projects.update');
Route::patch('construction/projects/{id}', [ConstructionContractController::class, 'update'])->whereNumber('id');
Route::delete('construction/projects/{id}', [ConstructionContractController::class, 'destroy'])->whereNumber('id')->name('construction.projects.destroy');
Route::put('construction/projects/{id}/progress', [ConstructionContractProgressController::class, 'processProgress'])->whereNumber('id')->name('construction.projects.progress');

// Construction Progress Logs
Route::get('construction/progress', [ConstructionProgressLogController::class, 'index'])->name('construction.progress.index');
Route::post('construction/progress', [ConstructionProgressLogController::class, 'store'])->name('construction.progress.store');
Route::get('construction/progress/{id}', [ConstructionProgressLogController::class, 'show'])->whereNumber('id')->name('construction.progress.show');
Route::put('construction/progress/{id}', [ConstructionProgressLogController::class, 'update'])->whereNumber('id')->name('construction.progress.update');
Route::patch('construction/progress/{id}', [ConstructionProgressLogController::class, 'update'])->whereNumber('id');
Route::delete('construction/progress/{id}', [ConstructionProgressLogController::class, 'destroy'])->whereNumber('id')->name('construction.progress.destroy');

// Handover / Completion Certificates
Route::get('construction/completion', [HandoverCertificateController::class, 'index'])->name('construction.completion.index');
Route::post('construction/completion', [HandoverCertificateController::class, 'store'])->name('construction.completion.store');
Route::get('construction/completion/{id}', [HandoverCertificateController::class, 'show'])->whereNumber('id')->name('construction.completion.show');
Route::put('construction/completion/{id}', [HandoverCertificateController::class, 'update'])->whereNumber('id')->name('construction.completion.update');
Route::patch('construction/completion/{id}', [HandoverCertificateController::class, 'update'])->whereNumber('id');
Route::delete('construction/completion/{id}', [HandoverCertificateController::class, 'destroy'])->whereNumber('id')->name('construction.completion.destroy');

// Funding Allocations
Route::get('construction/funding', [FundingAllocationController::class, 'index'])->name('construction.funding.index');
Route::post('construction/funding', [FundingAllocationController::class, 'store'])->name('construction.funding.store');
Route::get('construction/funding/{id}', [FundingAllocationController::class, 'show'])->whereNumber('id')->name('construction.funding.show');
Route::put('construction/funding/{id}', [FundingAllocationController::class, 'update'])->whereNumber('id')->name('construction.funding.update');
Route::patch('construction/funding/{id}', [FundingAllocationController::class, 'update'])->whereNumber('id');
Route::delete('construction/funding/{id}', [FundingAllocationController::class, 'destroy'])->whereNumber('id')->name('construction.funding.destroy');
Route::post('construction/funding/{id}/disburse', [FundingDisbursementController::class, 'processDisbursement'])->whereNumber('id')->name('construction.funding.disburse');

// Land Benefit Verifications
Route::get('construction/benefits', [LandBenefitVerificationController::class, 'index'])->name('construction.benefits.index');
Route::post('construction/benefits', [LandBenefitVerificationController::class, 'store'])->name('construction.benefits.store');
Route::get('construction/benefits/{id}', [LandBenefitVerificationController::class, 'show'])->whereNumber('id')->name('construction.benefits.show');
Route::put('construction/benefits/{id}', [LandBenefitVerificationController::class, 'update'])->whereNumber('id')->name('construction.benefits.update');
Route::patch('construction/benefits/{id}', [LandBenefitVerificationController::class, 'update'])->whereNumber('id');
Route::delete('construction/benefits/{id}', [LandBenefitVerificationController::class, 'destroy'])->whereNumber('id')->name('construction.benefits.destroy');


// =========================================================================
// 3. IRRIGATION INSTITUTIONS MANAGEMENT
// =========================================================================

// Water Users Associations
Route::get('institutions/water-users-associations', [WaterUsersAssociationController::class, 'index'])->name('institutions.water-users-associations.index');
Route::post('institutions/water-users-associations', [WaterUsersAssociationController::class, 'store'])->name('institutions.water-users-associations.store');
Route::get('institutions/water-users-associations/{id}', [WaterUsersAssociationController::class, 'show'])->whereNumber('id')->name('institutions.water-users-associations.show');
Route::put('institutions/water-users-associations/{id}', [WaterUsersAssociationController::class, 'update'])->whereNumber('id')->name('institutions.water-users-associations.update');
Route::patch('institutions/water-users-associations/{id}', [WaterUsersAssociationController::class, 'update'])->whereNumber('id');
Route::delete('institutions/water-users-associations/{id}', [WaterUsersAssociationController::class, 'destroy'])->whereNumber('id')->name('institutions.water-users-associations.destroy');

// Assessment & Audit
Route::get('institutions/assessment-audit', [AssociationAuditController::class, 'index'])->name('institutions.assessment-audit.index');
Route::get('institutions/assessment-audit/{id}', [AssociationAuditController::class, 'show'])->whereNumber('id')->name('institutions.assessment-audit.show');
Route::put('institutions/assessment-audit/{id}', [AssociationAuditController::class, 'update'])->whereNumber('id')->name('institutions.assessment-audit.update');
Route::patch('institutions/assessment-audit/{id}', [AssociationAuditController::class, 'update'])->whereNumber('id');
Route::delete('institutions/assessment-audit/{id}', [AssociationAuditController::class, 'destroy'])->whereNumber('id')->name('institutions.assessment-audit.destroy');

// Capacity Building
Route::get('institutions/capacity-building', [AssociationTrainingController::class, 'index'])->name('institutions.capacity-building.index');
Route::post('institutions/capacity-building', [AssociationTrainingController::class, 'store'])->name('institutions.capacity-building.store');
Route::get('institutions/capacity-building/{id}', [AssociationTrainingController::class, 'show'])->whereNumber('id')->name('institutions.capacity-building.show');
Route::put('institutions/capacity-building/{id}', [AssociationTrainingController::class, 'update'])->whereNumber('id')->name('institutions.capacity-building.update');
Route::patch('institutions/capacity-building/{id}', [AssociationTrainingController::class, 'update'])->whereNumber('id');
Route::delete('institutions/capacity-building/{id}', [AssociationTrainingController::class, 'destroy'])->whereNumber('id')->name('institutions.capacity-building.destroy');

// Maintenance & Cleaning
Route::get('institutions/maintenance-cleaning', [SchemeMaintenanceController::class, 'index'])->name('institutions.maintenance-cleaning.index');
Route::post('institutions/maintenance-cleaning', [SchemeMaintenanceController::class, 'store'])->name('institutions.maintenance-cleaning.store');
Route::get('institutions/maintenance-cleaning/{id}', [SchemeMaintenanceController::class, 'show'])->whereNumber('id')->name('institutions.maintenance-cleaning.show');
Route::put('institutions/maintenance-cleaning/{id}', [SchemeMaintenanceController::class, 'update'])->whereNumber('id')->name('institutions.maintenance-cleaning.update');
Route::patch('institutions/maintenance-cleaning/{id}', [SchemeMaintenanceController::class, 'update'])->whereNumber('id');
Route::delete('institutions/maintenance-cleaning/{id}', [SchemeMaintenanceController::class, 'destroy'])->whereNumber('id')->name('institutions.maintenance-cleaning.destroy');


// =========================================================================
// 4. IRRIGATION WATER UTILIZATION
// =========================================================================

// Irrigated Area
Route::get('water-utilization/irrigated-area', [IrrigatedAreaController::class, 'index'])->name('water-utilization.irrigated-area.index');
Route::post('water-utilization/irrigated-area', [IrrigatedAreaController::class, 'store'])->name('water-utilization.irrigated-area.store');
Route::get('water-utilization/irrigated-area/{id}', [IrrigatedAreaController::class, 'show'])->whereNumber('id')->name('water-utilization.irrigated-area.show');
Route::put('water-utilization/irrigated-area/{id}', [IrrigatedAreaController::class, 'update'])->whereNumber('id')->name('water-utilization.irrigated-area.update');
Route::patch('water-utilization/irrigated-area/{id}', [IrrigatedAreaController::class, 'update'])->whereNumber('id');
Route::delete('water-utilization/irrigated-area/{id}', [IrrigatedAreaController::class, 'destroy'])->whereNumber('id')->name('water-utilization.irrigated-area.destroy');

// Water Sources
Route::get('water-utilization/water-sources', [WaterSourceController::class, 'index'])->name('water-utilization.water-sources.index');
Route::post('water-utilization/water-sources', [WaterSourceController::class, 'store'])->name('water-utilization.water-sources.store');
Route::get('water-utilization/water-sources/{id}', [WaterSourceController::class, 'show'])->whereNumber('id')->name('water-utilization.water-sources.show');
Route::put('water-utilization/water-sources/{id}', [WaterSourceController::class, 'update'])->whereNumber('id')->name('water-utilization.water-sources.update');
Route::patch('water-utilization/water-sources/{id}', [WaterSourceController::class, 'update'])->whereNumber('id');
Route::delete('water-utilization/water-sources/{id}', [WaterSourceController::class, 'destroy'])->whereNumber('id')->name('water-utilization.water-sources.destroy');


// =========================================================================
// 5. IRRIGATION CROP PRODUCTION & YIELD
// =========================================================================

// Production Overview
Route::get('production/overview', ProductionOverviewController::class)->name('production.overview');

// Seasonal Production
Route::get('production/seasonal-production', [SeasonalProductionController::class, 'index'])->name('production.seasonal-production.index');
Route::post('production/seasonal-production', [SeasonalProductionController::class, 'store'])->name('production.seasonal-production.store');
Route::get('production/seasonal-production/{id}', [SeasonalProductionController::class, 'show'])->whereNumber('id')->name('production.seasonal-production.show');
Route::put('production/seasonal-production/{id}', [SeasonalProductionController::class, 'update'])->whereNumber('id')->name('production.seasonal-production.update');
Route::patch('production/seasonal-production/{id}', [SeasonalProductionController::class, 'update'])->whereNumber('id');
Route::delete('production/seasonal-production/{id}', [SeasonalProductionController::class, 'destroy'])->whereNumber('id')->name('production.seasonal-production.destroy');

// Highland Wheat Clusters
Route::get('production/highland-wheat', [HighlandWheatClusterController::class, 'index'])->name('production.highland-wheat.index');
Route::post('production/highland-wheat', [HighlandWheatClusterController::class, 'store'])->name('production.highland-wheat.store');
Route::get('production/highland-wheat/{id}', [HighlandWheatClusterController::class, 'show'])->whereNumber('id')->name('production.highland-wheat.show');
Route::put('production/highland-wheat/{id}', [HighlandWheatClusterController::class, 'update'])->whereNumber('id')->name('production.highland-wheat.update');
Route::patch('production/highland-wheat/{id}', [HighlandWheatClusterController::class, 'update'])->whereNumber('id');
Route::delete('production/highland-wheat/{id}', [HighlandWheatClusterController::class, 'destroy'])->whereNumber('id')->name('production.highland-wheat.destroy');


// =========================================================================
// ANALYTICS & REPORTS
// =========================================================================
Route::get('reports/{report}', [IrrigationReportController::class, 'show'])
    ->whereIn('report', array_keys(IrrigationReportController::REPORTS))
    ->name('reports.show');

    });
});
