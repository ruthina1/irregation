<?php

namespace Modules\Irrigation\Database\Seeders;

use App\Models\Kebele;
use App\Models\Woreda;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Modules\Irrigation\Models\AgriculturalInputs\InputAllocation;
use Modules\Irrigation\Models\Construction\ConstructionContract;
use Modules\Irrigation\Models\Construction\ConstructionProgressLog;
use Modules\Irrigation\Models\Construction\FundingAllocation;
use Modules\Irrigation\Models\Construction\HandoverCertificate;
use Modules\Irrigation\Models\Construction\LandBenefitVerification;
use Modules\Irrigation\Models\Institutions\AssociationAudit;
use Modules\Irrigation\Models\Institutions\AssociationTraining;
use Modules\Irrigation\Models\Institutions\SchemeMaintenance;
use Modules\Irrigation\Models\Institutions\WaterUsersAssociation;
use Modules\Irrigation\Models\Production\HighlandWheatCluster;
use Modules\Irrigation\Models\Production\SeasonalProduction;
use Modules\Irrigation\Models\StudyDesign\ConstructionReadyDesign;
use Modules\Irrigation\Models\StudyDesign\DesignDocumentReview;
use Modules\Irrigation\Models\StudyDesign\DesignQualityAudit;
use Modules\Irrigation\Models\StudyDesign\PipelineProject;
use Modules\Irrigation\Models\StudyDesign\ProfessionalTraining;
use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;
use Modules\Irrigation\Models\WaterUtilization\IrrigatedArea;
use Modules\Irrigation\Models\WaterUtilization\WaterSource;

class IrrigationSampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $zones = Zone::with(['woredas.kebeles'])->get();

        if ($zones->isEmpty()) {
            return;
        }

        $programs = [
            'Regional Treasury',
            'World Bank PACT',
            'FSRP',
            'GCF',
            'DRDIP',
            'AGP-II',
        ];

        $schemesByZone = [
            'Mirab Gojjam' => [
                'p1' => 'Koga Large Scale Modern Irrigation Scheme',
                'p2' => 'Birr River Smallholder Gravity Diversion',
                'p3' => 'Mecha Yilmana Secondary Canal Network',
            ],
            'Misraq Gojjam' => [
                'p1' => 'Chemoga-Yeda Irrigation Scheme',
                'p2' => 'Robit River Multi-Cell Weir',
                'p3' => 'Aneded Watershed Spate Diversion',
            ],
            'Debub gonder' => [
                'p1' => 'Ribb Main Canal Extension Package',
                'p2' => 'Fogera Plain Rice & Wheat Command',
                'p3' => 'Gumara Modern Diversion Headwork',
            ],
            'Semen Gondar' => [
                'p1' => 'Megech Pump Irrigation Sub-Scheme A',
                'p2' => 'Angereb River Diversion Weir',
                'p3' => 'Debark Highland Catchment Development',
            ],
            'Semen Wollo' => [
                'p1' => 'Raya Kobo Valley Pressurized Scheme',
                'p2' => 'Kobo Girana Valley Modern Canal',
                'p3' => 'Golina River Concrete Diversion Weir',
            ],
            'Debub Wollo' => [
                'p1' => 'Borkena Modern River Intake & Pumping',
                'p2' => 'Kalu Valley Smallholder Irrigation',
                'p3' => 'Cheffa Wetland Micro-Irrigation Network',
            ],
            'Semen Shewa' => [
                'p1' => 'Jemma Basin Smallholder Diversion',
                'p2' => 'Beressa River Modern Concrete Weir',
                'p3' => 'Angolela Cold-Tolerant Wheat Command',
            ],
            'Awi' => [
                'p1' => 'Dangila Groundwater Hybrid Scheme',
                'p2' => 'Zengena Lake Perimeter Irrigation',
                'p3' => 'Beleles River Intake & Canal Network',
            ],
            'ባህር ዳር' => [
                'p1' => 'Abay Basin Solar River Lift Scheme',
                'p2' => 'Tana Shoreline Micro-Irrigation Perimeter',
                'p3' => 'Tis Abay Agro-Industrial Canal Extension',
            ],
            'Wag Hemra' => [
                'p1' => 'Sekota Valley Rainwater Diversion Scheme',
                'p2' => 'Tekeze Basin Solar Hybrid Well Pumping',
                'p3' => 'Dahana Drought-Resilience Gravity Weir',
            ],
        ];

        $targetYears = ['2019 E.C.', '2018 E.C.'];

        foreach ($targetYears as $yearIndex => $fiscalYear) {
            $yearTag = $yearIndex === 0 ? '19' : '18';

            foreach ($zones as $zoneIdx => $zone) {
                $zoneName = $zone->name;
                $woreda = $zone->woredas->first();
                $woredaName = $woreda?->name ?? ($zoneName . ' Woreda');
                $woredaId = $woreda?->id;

                $kebele = $woreda?->kebeles?->first();
                $kebeleName = $kebele?->name ?? ($woredaName . ' Kebele 01');
                $kebeleId = $kebele?->id;
                $zoneId = $zone->id;

                $names = $schemesByZone[$zoneName] ?? [
                    'p1' => "{$zoneName} Valley Diversion Scheme",
                    'p2' => "{$zoneName} Highland Intake Weir",
                    'p3' => "{$zoneName} Secondary Canal Network",
                ];

                $program = $programs[$zoneIdx % count($programs)];
                $altProgram = $programs[($zoneIdx + 2) % count($programs)];

                // 1. Pipeline Projects
                $pl1Code = sprintf('PL-%s-%02d-1', $yearTag, $zoneId);
                $pipeline1 = PipelineProject::updateOrCreate(
                    ['pipeline_code' => $pl1Code],
                    [
                        'scheme_name' => $names['p1'],
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'pipeline_status' => 'Reconnaissance Completed',
                        'initiative_source' => 'Regional Master Plan',
                        'water_source' => 'River Diversion',
                        'priority_level' => 'Critical',
                        'potential_area_ha' => 450.00 + ($zoneIdx * 35),
                        'estimated_budget_etb' => 18000000.00 + ($zoneIdx * 1500000),
                        'estimated_beneficiaries_male' => 380 + ($zoneIdx * 25),
                        'estimated_beneficiaries_female' => 210 + ($zoneIdx * 15),
                        'site_notes' => "High perennial base flow and suitable gravity weir diversion topography in {$zoneName}.",
                        'promoted_to_study' => true,
                    ]
                );

                $pl2Code = sprintf('PL-%s-%02d-2', $yearTag, $zoneId);
                PipelineProject::updateOrCreate(
                    ['pipeline_code' => $pl2Code],
                    [
                        'scheme_name' => $names['p2'],
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'pipeline_status' => 'Initial Pipeline Identification',
                        'initiative_source' => 'Community Request',
                        'water_source' => 'River Diversion',
                        'priority_level' => 'High',
                        'potential_area_ha' => 320.00 + ($zoneIdx * 20),
                        'estimated_budget_etb' => 12500000.00 + ($zoneIdx * 1000000),
                        'estimated_beneficiaries_male' => 260 + ($zoneIdx * 20),
                        'estimated_beneficiaries_female' => 140 + ($zoneIdx * 10),
                        'site_notes' => "Community request verified with stable hydrological catchment.",
                        'promoted_to_study' => false,
                    ]
                );

                // 2. Study & Design Projects
                // Study 1: Active Study (is_construction_ready = false)
                $std1Code = sprintf('STD-%s-%02d-1', $yearTag, $zoneId);
                $study1 = StudyDesignProject::updateOrCreate(
                    ['project_code' => $std1Code],
                    [
                        'project_name' => $names['p1'] . ' Study & Detailed Engineering',
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'study_stage' => 'Detailed Engineering Design',
                        'study_modality' => 'In-House Bureau Engineers',
                        'water_source' => 'River Diversion',
                        'lead_consultant_or_office' => 'Amhara Water & Irrigation Development Bureau',
                        'study_cost_etb' => 2200000.00 + ($zoneIdx * 120000),
                        'command_area_hectares' => 520.00 + ($zoneIdx * 40),
                        'beneficiaries_male' => 410 + ($zoneIdx * 30),
                        'beneficiaries_female' => 230 + ($zoneIdx * 20),
                        'experts_trained_male' => 8 + ($zoneIdx % 4),
                        'experts_trained_female' => 4 + ($zoneIdx % 3),
                        'is_construction_ready' => false,
                        'review_status' => 'Reviewed & Verified',
                        'qa_status' => 'In Review',
                        'pipeline_id' => $pipeline1->id,
                    ]
                );

                // Study 2: Construction-Ready (is_construction_ready = true)
                $std2Code = sprintf('STD-%s-%02d-2', $yearTag, $zoneId);
                $study2 = StudyDesignProject::updateOrCreate(
                    ['project_code' => $std2Code],
                    [
                        'project_name' => $names['p2'] . ' Comprehensive Design',
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'study_stage' => 'Tender Ready Design',
                        'study_modality' => 'Outsourced Consultant',
                        'water_source' => 'River Diversion',
                        'lead_consultant_or_office' => 'Amhara Design & Supervision Works Enterprise',
                        'study_cost_etb' => 3800000.00 + ($zoneIdx * 150000),
                        'command_area_hectares' => 640.00 + ($zoneIdx * 50),
                        'beneficiaries_male' => 520 + ($zoneIdx * 35),
                        'beneficiaries_female' => 310 + ($zoneIdx * 25),
                        'experts_trained_male' => 12 + ($zoneIdx % 5),
                        'experts_trained_female' => 6 + ($zoneIdx % 3),
                        'is_construction_ready' => true,
                        'review_status' => 'Reviewed & Verified',
                        'qa_status' => 'QA Passed & Certified',
                    ]
                );

                // 3. Design Document Review
                DesignDocumentReview::updateOrCreate(
                    ['review_code' => sprintf('REV-%s-%02d', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $study1->project_name,
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'project_id' => $study1->id,
                        'submitting_entity' => 'Regional In-House Bureau Engineering Team',
                        'command_area_ha' => $study1->command_area_hectares,
                        'review_milestone' => 'Final Detailed Design Report',
                        'document_volume' => 'Volume 3: Structural & Canal Hydraulics',
                        'submission_version' => 'Version 2.0',
                        'lead_reviewer' => 'Eng. Hailu Tadesse',
                        'overall_technical_score' => 88.50,
                        'review_verdict' => 'Approved with Minor Notes',
                    ]
                );

                // 4. Design Quality Audit
                DesignQualityAudit::updateOrCreate(
                    ['qa_certificate_no' => sprintf('QA-%s-%02d', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $study2->project_name,
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'project_id' => $study2->id,
                        'qa_domain' => 'Geotechnical & Structural Integrity Audit',
                        'command_area_ha' => $study2->command_area_hectares,
                        'lead_qa_auditor' => 'Dr. Birhanu Kebede',
                        'qa_institution' => 'Regional Water QA & Regulatory Directorate',
                        'compliance_score' => 93.50,
                        'qa_status' => 'Certified Compliant',
                    ]
                );

                // 5. Construction Ready Design (Shelf)
                ConstructionReadyDesign::updateOrCreate(
                    ['shelf_code' => sprintf('CRD-%s-%02d', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $study2->project_name,
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'project_id' => $study2->id,
                        'shelf_status' => 'Ready for Procurement Tender',
                        'estimated_construction_etb' => 52000000.00 + ($zoneIdx * 3500000),
                        'command_area_ha' => $study2->command_area_hectares,
                        'preferred_funding_channel' => $program,
                        'shelf_entry_ethiopian_date' => "{$fiscalYear}-03-15",
                    ]
                );

                // 6. Professional Training
                ProfessionalTraining::updateOrCreate(
                    ['training_code' => sprintf('TRN-%s-%02d', $yearTag, $zoneId)],
                    [
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'training_status' => 'Completed',
                        'course_title' => "Modern Small-Scale Irrigation Engineering & Hydrology ({$zoneName})",
                        'discipline' => 'Civil & Hydraulic Engineering',
                        'target_tier' => 'Zonal & Woreda Irrigation Engineers',
                        'sponsoring_program' => $program,
                        'training_venue' => 'Bahir Dar Agricultural Water Training Center',
                        'training_duration_days' => 5,
                        'male_participants' => 24 + ($zoneIdx % 6),
                        'female_participants' => 12 + ($zoneIdx % 4),
                        'lead_trainer' => 'Eng. Solomon Worku',
                    ]
                );

                // 7. Agricultural Input Allocations (Seed, Fertilizer, Compost)
                InputAllocation::updateOrCreate(
                    ['input_code' => sprintf('INP-%s-%02d-SEED', $yearTag, $zoneId)],
                    [
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'status' => 'Dispatched',
                        'irrigation_season' => 'Bega / Dry Season',
                        'cropping_round' => 'Round 1 (1ኛ ዙር)',
                        'input_name' => 'Improved Seed',
                        'specification' => 'Certified High-Yield Irrigated Bread Wheat (Kingbird)',
                        'unit' => 'Quintals',
                        'planned_target_qty' => 650.00 + ($zoneIdx * 45),
                        'distributed_qty' => 580.00 + ($zoneIdx * 40),
                        'covered_hectares' => 480.00 + ($zoneIdx * 35),
                        'funding_program' => $program,
                        'beneficiaries_male' => 390 + ($zoneIdx * 25),
                        'beneficiaries_female' => 210 + ($zoneIdx * 15),
                        'total_beneficiaries' => 600 + ($zoneIdx * 40),
                    ]
                );

                InputAllocation::updateOrCreate(
                    ['input_code' => sprintf('INP-%s-%02d-FERT', $yearTag, $zoneId)],
                    [
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'status' => 'Dispatched',
                        'irrigation_season' => 'Bega / Dry Season',
                        'cropping_round' => 'Round 1 (1ኛ ዙር)',
                        'input_name' => 'Fertilizer',
                        'specification' => 'NPSB & Urea High-Efficiency Blended Fertilizer',
                        'unit' => 'Quintals',
                        'planned_target_qty' => 1400.00 + ($zoneIdx * 90),
                        'distributed_qty' => 1250.00 + ($zoneIdx * 80),
                        'covered_hectares' => 480.00 + ($zoneIdx * 35),
                        'funding_program' => $program,
                        'beneficiaries_male' => 390 + ($zoneIdx * 25),
                        'beneficiaries_female' => 210 + ($zoneIdx * 15),
                        'total_beneficiaries' => 600 + ($zoneIdx * 40),
                    ]
                );

                InputAllocation::updateOrCreate(
                    ['input_code' => sprintf('INP-%s-%02d-COMP', $yearTag, $zoneId)],
                    [
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'status' => 'Dispatched',
                        'irrigation_season' => 'Bega / Dry Season',
                        'cropping_round' => 'Round 1 (1ኛ ዙር)',
                        'input_name' => 'Compost',
                        'specification' => 'Organic Farmyard & Biomass Bio-Fertilizer',
                        'unit' => 'Cubic Meters',
                        'planned_target_qty' => 2800.00 + ($zoneIdx * 150),
                        'distributed_qty' => 2450.00 + ($zoneIdx * 130),
                        'covered_hectares' => 380.00 + ($zoneIdx * 25),
                        'funding_program' => $program,
                        'beneficiaries_male' => 310 + ($zoneIdx * 20),
                        'beneficiaries_female' => 180 + ($zoneIdx * 10),
                        'total_beneficiaries' => 490 + ($zoneIdx * 30),
                    ]
                );

                // 8. Construction Contracts
                // Contract 1: New Construction
                $ctr1Code = sprintf('CTR-%s-%02d-1', $yearTag, $zoneId);
                $sum1 = 64000000.00 + ($zoneIdx * 4200000);
                $phys1 = 62.0 + (($zoneIdx * 3.5) % 30);
                $disb1 = round($sum1 * ($phys1 / 100) * 0.94, 2);

                $contract1 = ConstructionContract::updateOrCreate(
                    ['contract_code' => $ctr1Code],
                    [
                        'scheme_name' => $names['p1'] . ' Construction Work Package',
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'construction_status' => 'Under Active Construction',
                        'project_code' => sprintf('PRJ-%s-%02d-A', $yearTag, $zoneId),
                        'scheme_type' => 'New Construction',
                        'funding_source' => $program,
                        'contractor_name' => 'Amhara Water Works Construction Enterprise',
                        'contractor_grade' => 'GC-1',
                        'consultant_supervisor' => 'Amhara Design & Supervision Works Enterprise',
                        'contract_sum_etb' => $sum1,
                        'disbursed_sum_etb' => $disb1,
                        'defect_liability_months' => 12,
                        'physical_progress_pct' => $phys1,
                        'planned_progress_pct' => min(98.0, $phys1 + 4.0),
                        'financial_progress_pct' => round(($disb1 / $sum1) * 100, 2),
                        'health_status' => $phys1 >= 60.0 ? 'On Track' : 'Behind Schedule',
                        'command_area_ha' => 780.00 + ($zoneIdx * 60),
                        'beneficiaries_male' => 620 + ($zoneIdx * 40),
                        'beneficiaries_female' => 380 + ($zoneIdx * 25),
                        'total_beneficiaries' => 1000 + ($zoneIdx * 65),
                    ]
                );

                // Contract 2: Existing Rehabilitation
                $ctr2Code = sprintf('CTR-%s-%02d-2', $yearTag, $zoneId);
                $sum2 = 38000000.00 + ($zoneIdx * 2500000);
                $phys2 = 78.0 + (($zoneIdx * 2.8) % 18);
                $disb2 = round($sum2 * ($phys2 / 100) * 0.96, 2);

                $contract2 = ConstructionContract::updateOrCreate(
                    ['contract_code' => $ctr2Code],
                    [
                        'scheme_name' => $names['p3'] . ' Canal Lining & Rehabilitation',
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'construction_status' => 'Under Active Construction',
                        'project_code' => sprintf('PRJ-%s-%02d-B', $yearTag, $zoneId),
                        'scheme_type' => 'Existing Rehabilitation',
                        'funding_source' => $altProgram,
                        'contractor_name' => 'Tana Water Works & General Contractor',
                        'contractor_grade' => 'GC-2',
                        'consultant_supervisor' => 'Water Works Design & Supervision Enterprise',
                        'contract_sum_etb' => $sum2,
                        'disbursed_sum_etb' => $disb2,
                        'defect_liability_months' => 12,
                        'physical_progress_pct' => $phys2,
                        'planned_progress_pct' => min(98.0, $phys2 + 2.0),
                        'financial_progress_pct' => round(($disb2 / $sum2) * 100, 2),
                        'health_status' => 'Ahead of Schedule',
                        'command_area_ha' => 520.00 + ($zoneIdx * 35),
                        'beneficiaries_male' => 450 + ($zoneIdx * 30),
                        'beneficiaries_female' => 260 + ($zoneIdx * 18),
                        'total_beneficiaries' => 710 + ($zoneIdx * 48),
                    ]
                );

                // 9. Construction Progress Logs
                ConstructionProgressLog::updateOrCreate(
                    ['progress_log_code' => sprintf('LOG-%s-%02d-1', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $contract1->scheme_name,
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'contract_id' => $contract1->id,
                        'health_status' => $contract1->health_status,
                        'planned_progress_pct' => $contract1->planned_progress_pct,
                        'physical_progress_pct' => $contract1->physical_progress_pct,
                        'financial_progress_pct' => $contract1->financial_progress_pct,
                        'weir_concreting_pct' => 92.00,
                        'canal_excavation_pct' => 85.00,
                        'canal_lining_km' => 16.50 + ($zoneIdx * 1.2),
                        'target_canal_lining_km' => 24.00 + ($zoneIdx * 1.5),
                        'gates_installed_count' => 14,
                        'target_gates_count' => 18,
                        'resident_engineer' => 'Eng. Dereje Mengistu',
                    ]
                );

                // 10. Handover Certificate (for previous or completed milestone)
                HandoverCertificate::updateOrCreate(
                    ['handover_certificate_no' => sprintf('HC-%s-%02d', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $names['p3'] . ' Substantial Section Handover',
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'handover_status' => 'Substantial Completion Handed Over',
                        'contract_code' => $contract2->contract_code,
                        'recipient_wua' => "{$zoneName} Valley Water Users Association",
                        'command_area_ha' => 420.00 + ($zoneIdx * 30),
                        'beneficiaries_male' => 360 + ($zoneIdx * 20),
                        'beneficiaries_female' => 210 + ($zoneIdx * 15),
                        'contract_sum_etb' => $sum2,
                        'retention_money_etb' => round($sum2 * 0.05, 2),
                        'defect_liability_months' => 12,
                        'snag_items_count' => 2,
                        'handover_committee_lead' => 'Eng. Getachew Bekele',
                    ]
                );

                // 11. Funding Allocations (Program Portfolio records)
                FundingAllocation::updateOrCreate(
                    ['funding_code' => sprintf('FND-%s-%02d-1', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $contract1->scheme_name,
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'allocation_status' => 'Active Disbursement',
                        'contract_code' => $contract1->contract_code,
                        'project_code' => $contract1->project_code,
                        'funding_program' => $program,
                        'donor_account_ref' => sprintf('ETH-%s-TR-%02d', strtoupper(substr($program, 0, 4)), $zoneId),
                        'total_allocated_budget_etb' => $sum1,
                        'cumulative_disbursed_etb' => $disb1,
                        'remaining_balance_etb' => $sum1 - $disb1,
                        'financial_burn_rate_pct' => round(($disb1 / $sum1) * 100, 2),
                    ]
                );

                FundingAllocation::updateOrCreate(
                    ['funding_code' => sprintf('FND-%s-%02d-2', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $contract2->scheme_name,
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'allocation_status' => 'Active Disbursement',
                        'contract_code' => $contract2->contract_code,
                        'project_code' => $contract2->project_code,
                        'funding_program' => $altProgram,
                        'donor_account_ref' => sprintf('ETH-%s-CR-%02d', strtoupper(substr($altProgram, 0, 4)), $zoneId),
                        'total_allocated_budget_etb' => $sum2,
                        'cumulative_disbursed_etb' => $disb2,
                        'remaining_balance_etb' => $sum2 - $disb2,
                        'financial_burn_rate_pct' => round(($disb2 / $sum2) * 100, 2),
                    ]
                );

                // 12. Land Benefit Verification
                LandBenefitVerification::updateOrCreate(
                    ['benefit_code' => sprintf('BNF-%s-%02d-1', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $contract1->scheme_name,
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'benefit_status' => 'Verified & Operational',
                        'contract_code' => $contract1->contract_code,
                        'project_code' => $contract1->project_code,
                        'scheme_type' => $contract1->scheme_type,
                        'funding_source' => $program,
                        'planned_command_ha' => $contract1->command_area_ha,
                        'actual_developed_ha' => round($contract1->command_area_ha * 0.88, 2),
                        'operational_cultivated_ha' => round($contract1->command_area_ha * 0.82, 2),
                        'beneficiaries_male' => $contract1->beneficiaries_male,
                        'beneficiaries_female' => $contract1->beneficiaries_female,
                        'total_beneficiaries' => $contract1->total_beneficiaries,
                        'youth_beneficiaries_count' => 180 + ($zoneIdx * 15),
                        'primary_crops_cultivated' => ['Irrigated Wheat', 'Red Onion', 'Tomato', 'Maize'],
                        'cropping_intensity_ratio' => 1.85,
                        'verifying_agronomist' => 'Agronomist Yonas Assefa',
                    ]
                );

                LandBenefitVerification::updateOrCreate(
                    ['benefit_code' => sprintf('BNF-%s-%02d-2', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $contract2->scheme_name,
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'benefit_status' => 'Verified & Operational',
                        'contract_code' => $contract2->contract_code,
                        'project_code' => $contract2->project_code,
                        'scheme_type' => $contract2->scheme_type,
                        'funding_source' => $altProgram,
                        'planned_command_ha' => $contract2->command_area_ha,
                        'actual_developed_ha' => round($contract2->command_area_ha * 0.92, 2),
                        'operational_cultivated_ha' => round($contract2->command_area_ha * 0.86, 2),
                        'beneficiaries_male' => $contract2->beneficiaries_male,
                        'beneficiaries_female' => $contract2->beneficiaries_female,
                        'total_beneficiaries' => $contract2->total_beneficiaries,
                        'youth_beneficiaries_count' => 135 + ($zoneIdx * 12),
                        'primary_crops_cultivated' => ['Irrigated Wheat', 'Potato', 'Vegetables'],
                        'cropping_intensity_ratio' => 1.90,
                        'verifying_agronomist' => 'Agronomist Mesfin Girma',
                    ]
                );

                // 13. Water Users Associations (WUAs)
                // WUA 1: Newly Established WUA
                $wua1Code = sprintf('WUA-%s-%02d-1', $yearTag, $zoneId);
                $wua1Male = 280 + ($zoneIdx * 20);
                $wua1Female = 150 + ($zoneIdx * 12);

                $wua1 = WaterUsersAssociation::updateOrCreate(
                    ['wua_reg_code' => $wua1Code],
                    [
                        'scheme_name' => $names['p1'],
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'wua_name' => "{$zoneName} Primary Canal-1 Water Users Association",
                        'governance_status' => 'Fully Legally Registered',
                        'establishment_type' => 'Newly Established WUA',
                        'command_area_ha' => 450.00 + ($zoneIdx * 30),
                        'members_male' => $wua1Male,
                        'members_female' => $wua1Female,
                        'total_members' => $wua1Male + $wua1Female,
                        'chairperson_name' => 'Ato Alemayehu Molla',
                        'water_master_name' => 'Ato Belayneh Gashaw',
                        'committee_male' => 5,
                        'committee_female' => 3,
                        'sub_ketenas_count' => 6,
                        'distribution_regime' => 'Rotational Warabandi Schedule',
                        'annual_water_fee_etb_ha' => 480.00,
                        'fee_collection_rate_pct' => 91.50,
                        'registration_decree_ref' => sprintf('REG/WUA/%s/%03d', $yearTag, $zoneId * 10 + 1),
                        'bylaw_charter_status' => 'Ratified by General Assembly',
                    ]
                );

                // WUA 2: Existing Strengthened WUA
                $wua2Code = sprintf('WUA-%s-%02d-2', $yearTag, $zoneId);
                $wua2Male = 340 + ($zoneIdx * 25);
                $wua2Female = 180 + ($zoneIdx * 15);

                $wua2 = WaterUsersAssociation::updateOrCreate(
                    ['wua_reg_code' => $wua2Code],
                    [
                        'scheme_name' => $names['p3'],
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'wua_name' => "{$zoneName} Downstream Farmers Association",
                        'governance_status' => 'Fully Legally Registered',
                        'establishment_type' => 'Proclamation 841/2014 Framework',
                        'command_area_ha' => 380.00 + ($zoneIdx * 25),
                        'members_male' => $wua2Male,
                        'members_female' => $wua2Female,
                        'total_members' => $wua2Male + $wua2Female,
                        'chairperson_name' => 'Ato Kassahun Tadesse',
                        'water_master_name' => 'Ato Getnet Worku',
                        'committee_male' => 6,
                        'committee_female' => 2,
                        'sub_ketenas_count' => 5,
                        'distribution_regime' => 'Rotational Warabandi Schedule',
                        'annual_water_fee_etb_ha' => 420.00,
                        'fee_collection_rate_pct' => 88.00,
                        'registration_decree_ref' => sprintf('REG/WUA/%s/%03d', $yearTag, $zoneId * 10 + 2),
                        'bylaw_charter_status' => 'Ratified by General Assembly',
                    ]
                );

                // 14. Association Audits
                AssociationAudit::updateOrCreate(
                    ['audit_code' => sprintf('ADT-%s-%02d-1', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $wua1->scheme_name,
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'wua_id' => $wua1->id,
                        'wua_reg_code' => $wua1->wua_reg_code,
                        'wua_name' => $wua1->wua_name,
                        'audit_verdict' => 'Unqualified Audit Opinion',
                        'audit_scope' => 'Financial Accounts & By-Law Compliance',
                        'governance_grade' => 'Grade A',
                        'overall_health_score' => 91,
                        'audited_revenue_etb' => 245000.00 + ($zoneIdx * 15000),
                        'audited_expense_etb' => 195000.00 + ($zoneIdx * 12000),
                        'lead_auditor' => 'Ato Mulatu Gizaw (Senior Cooperative Auditor)',
                    ]
                );

                // 15. Association Training
                AssociationTraining::updateOrCreate(
                    ['training_code' => sprintf('WTRN-%s-%02d', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $wua1->scheme_name,
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'wua_id' => $wua1->id,
                        'training_status' => 'Completed',
                        'target_group' => 'WUA Executive Committee & Water Masters',
                        'training_module' => 'Water Scheduling, Asset O&M & Dispute Resolution',
                        'facilitator_channel' => 'Woreda Irrigation & Cooperative Office',
                        'training_venue' => "{$woredaName} Cooperative Hall",
                        'training_duration_days' => 3,
                        'exec_leaders_male' => 7,
                        'exec_leaders_female' => 3,
                        'members_male' => 38,
                        'members_female' => 20,
                        'lead_facilitator' => 'W/ro Selamawit Alemu',
                    ]
                );

                // 16. Scheme Maintenance (Modern & Traditional)
                SchemeMaintenance::updateOrCreate(
                    [
                        'scheme_name' => "{$names['p1']} Modern Main Canal Desilting",
                        'fiscal_year' => $fiscalYear,
                    ],
                    [
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'operation_status' => 'Routine Maintenance Executed',
                        'canal_type' => 'Modern Lined Main Canal',
                        'wua_name' => $wua1->wua_name,
                        'intervention_types' => ['Silt Removal', 'Joint Resealing', 'Gate Greasing'],
                        'repaired_cleaned_km' => 12.50 + ($zoneIdx * 1.5),
                        'command_area_protected_ha' => 450.00 + ($zoneIdx * 30),
                        'mobilized_labor_male' => 210 + ($zoneIdx * 15),
                        'mobilized_labor_female' => 120 + ($zoneIdx * 10),
                        'total_mobilized_labor' => 330 + ($zoneIdx * 25),
                        'funding_source' => 'WUA O&M Community Fund',
                        'lead_coordinator' => 'Ato Belayneh Gashaw (Water Master)',
                    ]
                );

                SchemeMaintenance::updateOrCreate(
                    [
                        'scheme_name' => "{$names['p3']} Traditional Canal Cleaning Campaign",
                        'fiscal_year' => $fiscalYear,
                    ],
                    [
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'operation_status' => 'Routine Maintenance Executed',
                        'canal_type' => 'Traditional Earthen Secondary Canal',
                        'wua_name' => $wua2->wua_name,
                        'intervention_types' => ['Weed Clearing', 'Embankment Compaction', 'Desilting'],
                        'repaired_cleaned_km' => 8.40 + ($zoneIdx * 0.9),
                        'command_area_protected_ha' => 380.00 + ($zoneIdx * 25),
                        'mobilized_labor_male' => 160 + ($zoneIdx * 12),
                        'mobilized_labor_female' => 95 + ($zoneIdx * 8),
                        'total_mobilized_labor' => 255 + ($zoneIdx * 20),
                        'funding_source' => 'Community Mobilization Labor',
                        'lead_coordinator' => 'Ato Getnet Worku (Water Master)',
                    ]
                );

                // 17. Irrigated Area Utilization (Round 1, Round 2, Round 3)
                $r1Ha = 480.00 + ($zoneIdx * 35);
                $r2Ha = 320.00 + ($zoneIdx * 25);
                $r3Ha = 180.00 + ($zoneIdx * 15);

                IrrigatedArea::updateOrCreate(
                    ['utilization_code' => sprintf('IRR-%s-%02d-R1', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $names['p1'],
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'water_adequacy_status' => 'Sufficient Water Availability',
                        'scheme_code' => sprintf('SCH-%s-%02d', $yearTag, $zoneId),
                        'cropping_round' => 'Round 1 (Bega)',
                        'wua_name' => $wua1->wua_name,
                        'land_modality' => 'Smallholder Individual Holdings',
                        'expansion_method' => 'Gravity Canal Basin Irrigation',
                        'planned_command_ha' => $r1Ha + 50.0,
                        'actual_irrigated_ha' => $r1Ha,
                        'expansion_area_ha' => 35.0,
                        'total_effective_irrigated_ha' => $r1Ha + 35.0,
                        'utilization_rate_pct' => 92.50,
                        'farmers_male' => 390 + ($zoneIdx * 25),
                        'farmers_female' => 210 + ($zoneIdx * 15),
                        'total_farmers' => 600 + ($zoneIdx * 40),
                        'dominant_crops' => 'Irrigated Bread Wheat, Red Onion',
                        'verifying_expert' => 'Agronomist Daniel Taye',
                    ]
                );

                IrrigatedArea::updateOrCreate(
                    ['utilization_code' => sprintf('IRR-%s-%02d-R2', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $names['p2'],
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'water_adequacy_status' => 'Sufficient Water Availability',
                        'scheme_code' => sprintf('SCH-%s-%02d-B', $yearTag, $zoneId),
                        'cropping_round' => 'Round 2 (Belg)',
                        'wua_name' => $wua2->wua_name,
                        'land_modality' => 'Smallholder Individual Holdings',
                        'expansion_method' => 'Gravity Canal Furrow Irrigation',
                        'planned_command_ha' => $r2Ha + 40.0,
                        'actual_irrigated_ha' => $r2Ha,
                        'expansion_area_ha' => 25.0,
                        'total_effective_irrigated_ha' => $r2Ha + 25.0,
                        'utilization_rate_pct' => 88.00,
                        'farmers_male' => 280 + ($zoneIdx * 20),
                        'farmers_female' => 150 + ($zoneIdx * 10),
                        'total_farmers' => 430 + ($zoneIdx * 30),
                        'dominant_crops' => 'Tomato, Potato, Cabbage',
                        'verifying_expert' => 'Agronomist Daniel Taye',
                    ]
                );

                IrrigatedArea::updateOrCreate(
                    ['utilization_code' => sprintf('IRR-%s-%02d-R3', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $names['p3'],
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'water_adequacy_status' => 'Sufficient Water Availability',
                        'scheme_code' => sprintf('SCH-%s-%02d-C', $yearTag, $zoneId),
                        'cropping_round' => 'Round 3 (Kiremt Supplement)',
                        'wua_name' => $wua1->wua_name,
                        'land_modality' => 'Smallholder Individual Holdings',
                        'expansion_method' => 'Spate & Supplemental Diverted Canal',
                        'planned_command_ha' => $r3Ha + 30.0,
                        'actual_irrigated_ha' => $r3Ha,
                        'expansion_area_ha' => 15.0,
                        'total_effective_irrigated_ha' => $r3Ha + 15.0,
                        'utilization_rate_pct' => 85.00,
                        'farmers_male' => 180 + ($zoneIdx * 15),
                        'farmers_female' => 95 + ($zoneIdx * 8),
                        'total_farmers' => 275 + ($zoneIdx * 23),
                        'dominant_crops' => 'Maize, Pulses, Seed Wheat',
                        'verifying_expert' => 'Agronomist Mesfin Girma',
                    ]
                );

                // 18. Water Sources (Solar, Deep Well, Gravity)
                WaterSource::updateOrCreate(
                    [
                        'scheme_name' => "{$names['p1']} Solar Hybrid Pumping Station",
                        'fiscal_year' => $fiscalYear,
                    ],
                    [
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'operational_status' => 'Fully Functional & Pumping',
                        'wua_name' => $wua1->wua_name,
                        'technology_type' => 'Solar Hybrid Submersible Pump',
                        'equipment_units_count' => 3,
                        'discharge_capacity_liters_sec' => 45.00,
                        'command_area_served_ha' => 120.00 + ($zoneIdx * 10),
                        'energy_source' => 'Solar Photovoltaic with Grid Backup',
                        'farmers_male' => 110 + ($zoneIdx * 8),
                        'farmers_female' => 65 + ($zoneIdx * 5),
                        'total_farmers' => 175 + ($zoneIdx * 13),
                        'installation_eth_year' => $fiscalYear,
                    ]
                );

                WaterSource::updateOrCreate(
                    [
                        'scheme_name' => "{$names['p2']} Deep Well Groundwater Intake",
                        'fiscal_year' => $fiscalYear,
                    ],
                    [
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'operational_status' => 'Fully Functional & Pumping',
                        'wua_name' => $wua2->wua_name,
                        'technology_type' => 'Deep Groundwater Production Well',
                        'equipment_units_count' => 2,
                        'discharge_capacity_liters_sec' => 38.00,
                        'command_area_served_ha' => 95.00 + ($zoneIdx * 8),
                        'energy_source' => 'National Grid Electric Motor',
                        'farmers_male' => 85 + ($zoneIdx * 6),
                        'farmers_female' => 45 + ($zoneIdx * 4),
                        'total_farmers' => 130 + ($zoneIdx * 10),
                        'installation_eth_year' => $fiscalYear,
                    ]
                );

                // 19. Seasonal Production
                $prodHa1 = 380.00 + ($zoneIdx * 25);
                $yieldQt1 = round($prodHa1 * 38.5, 2);

                SeasonalProduction::updateOrCreate(
                    ['production_code' => sprintf('PRD-%s-%02d-WHT', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $names['p1'] . ' Bega Bread Wheat Harvest',
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'harvest_status' => 'Harvest Completed & Threshed',
                        'cropping_round' => 'Round 1 (Bega)',
                        'crop_category' => 'Cereal Crops',
                        'specific_crop' => 'Irrigated Bread Wheat',
                        'cultivated_area_ha' => $prodHa1,
                        'production_yield_quintals' => $yieldQt1,
                        'productivity_qt_per_ha' => 38.50,
                        'farmers_male' => 310 + ($zoneIdx * 20),
                        'farmers_female' => 160 + ($zoneIdx * 10),
                        'total_farmers' => 470 + ($zoneIdx * 30),
                        'verifying_agronomist' => 'Inspecting Officer Daniel Taye',
                    ]
                );

                $prodHa2 = 210.00 + ($zoneIdx * 18);
                $yieldQt2 = round($prodHa2 * 145.0, 2);

                SeasonalProduction::updateOrCreate(
                    ['production_code' => sprintf('PRD-%s-%02d-VEG', $yearTag, $zoneId)],
                    [
                        'scheme_name' => $names['p2'] . ' Belg Red Onion Harvest',
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'harvest_status' => 'Harvest Completed & Threshed',
                        'cropping_round' => 'Round 2 (Belg)',
                        'crop_category' => 'Vegetable Crops',
                        'specific_crop' => 'Red Onion',
                        'cultivated_area_ha' => $prodHa2,
                        'production_yield_quintals' => $yieldQt2,
                        'productivity_qt_per_ha' => 145.00,
                        'farmers_male' => 190 + ($zoneIdx * 14),
                        'farmers_female' => 110 + ($zoneIdx * 8),
                        'total_farmers' => 300 + ($zoneIdx * 22),
                        'verifying_agronomist' => 'Agronomist Yonas Assefa',
                    ]
                );

                // 20. Highland Wheat Clusters
                $wheatHa = 340.00 + ($zoneIdx * 25);
                $wheatExpQt = round($wheatHa * 42.0, 2);
                $hwcMale = 260 + ($zoneIdx * 18);
                $hwcFemale = 135 + ($zoneIdx * 10);

                HighlandWheatCluster::updateOrCreate(
                    ['initiative_code' => sprintf('HWC-%s-%02d', $yearTag, $zoneId)],
                    [
                        'scheme_name' => "{$zoneName} Highland Wheat Acceleration Cluster",
                        'fiscal_year' => $fiscalYear,
                        'zone' => $zoneName,
                        'woreda' => $woredaName,
                        'kebele' => $kebeleName,
                        'zone_id' => $zoneId,
                        'woreda_id' => $woredaId,
                        'kebele_id' => $kebeleId,
                        'verification_status' => 'Cluster Verified & Certified',
                        'cropping_round' => 'Round 1 / Bega',
                        'wheat_variety' => 'Kingbird / Ogolcho Certified',
                        'cluster_block_code' => sprintf('BLK-HWC-%02d', $zoneId),
                        'wheat_command_ha' => $wheatHa,
                        'expected_yield_qt' => $wheatExpQt,
                        'productivity_qt_ha' => 42.00,
                        'farmers_male' => $hwcMale,
                        'farmers_female' => $hwcFemale,
                        'total_farmers' => $hwcMale + $hwcFemale,
                        'mechanized_harvesting' => true,
                        'lead_agronomist' => 'Cluster Coordinator Berhanu Zeleke',
                    ]
                );
            }
        }
    }
}
