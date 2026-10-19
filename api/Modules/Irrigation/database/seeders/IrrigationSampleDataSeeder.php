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
        $zone = Zone::first();
        $woreda = Woreda::first();
        $kebele = Kebele::first();

        $zoneId = $zone?->id ?? 1;
        $woredaId = $woreda?->id ?? 1;
        $kebeleId = $kebele?->id ?? 1;
        $zoneName = $zone?->name ?? 'Mirab Gojjam';
        $woredaName = $woreda?->name ?? 'Mecha';
        $kebeleName = $kebele?->name ?? 'Wetet Abay';
        $fiscalYear = '2016';

        // 1. Pipeline Projects
        $pipeline1 = PipelineProject::firstOrCreate(
            ['pipeline_code' => 'PL-2016-001'],
            [
                'scheme_name' => 'Kobo Girana Valley Diversion Scheme',
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
                'potential_area_ha' => 450.00,
                'estimated_budget_etb' => 12500000.00,
                'estimated_beneficiaries_male' => 320,
                'estimated_beneficiaries_female' => 180,
                'site_notes' => 'Topography is suitable for gravity weir diversion with minimal excavation needed.',
                'promoted_to_study' => false,
            ]
        );

        $pipeline2 = PipelineProject::firstOrCreate(
            ['pipeline_code' => 'PL-2016-002'],
            [
                'scheme_name' => 'Borkena Modern River Intake',
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
                'potential_area_ha' => 820.50,
                'estimated_budget_etb' => 28000000.00,
                'estimated_beneficiaries_male' => 610,
                'estimated_beneficiaries_female' => 390,
                'site_notes' => 'Reconnaissance field visit confirms high perennial base flow.',
                'promoted_to_study' => false,
            ]
        );

        // 2. Study & Design Projects
        $study1 = StudyDesignProject::firstOrCreate(
            ['project_code' => 'STD-2016-001'],
            [
                'project_name' => 'Raya Kobo Valley Irrigation Study',
                'fiscal_year' => $fiscalYear,
                'zone' => $zoneName,
                'woreda' => $woredaName,
                'kebele' => $kebeleName,
                'zone_id' => $zoneId,
                'woreda_id' => $woredaId,
                'kebele_id' => $kebeleId,
                'study_stage' => 'Feasibility Study',
                'study_modality' => 'Outsourced Consultant',
                'water_source' => 'River Diversion',
                'lead_consultant_or_office' => 'National Water Works Design Enterprise',
                'study_cost_etb' => 3400000.00,
                'command_area_hectares' => 650.00,
                'beneficiaries_male' => 450,
                'beneficiaries_female' => 280,
                'experts_trained_male' => 12,
                'experts_trained_female' => 6,
                'is_construction_ready' => false,
                'pipeline_id' => $pipeline1->id,
            ]
        );

        $study2 = StudyDesignProject::firstOrCreate(
            ['project_code' => 'STD-2016-002'],
            [
                'project_name' => 'Mecha River Small-Scale Diversion',
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
                'lead_consultant_or_office' => 'Regional Water & Irrigation Directorate',
                'study_cost_etb' => 1800000.00,
                'command_area_hectares' => 520.00,
                'beneficiaries_male' => 380,
                'beneficiaries_female' => 210,
                'experts_trained_male' => 8,
                'experts_trained_female' => 4,
                'is_construction_ready' => true,
            ]
        );

        // 3. Design Document Reviews
        DesignDocumentReview::firstOrCreate(
            ['review_code' => 'REV-2016-001'],
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
                'submitting_entity' => 'National Water Works Design Enterprise',
                'command_area_ha' => 650.00,
                'review_milestone' => 'Draft Feasibility Report',
                'document_volume' => 'Volume 2: Hydrology & Agronomy',
                'submission_version' => 'Version 1.0',
                'lead_reviewer' => 'Eng. Hailu Tadesse',
                'overall_technical_score' => 84.50,
                'review_verdict' => 'Conditionally Approved',
            ]
        );

        // 4. Design Quality Audits
        DesignQualityAudit::firstOrCreate(
            ['qa_certificate_no' => 'QA-2016-001'],
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
                'qa_domain' => 'Structural & Geotechnical Audit',
                'command_area_ha' => 520.00,
                'lead_qa_auditor' => 'Dr. Birhanu Kebede',
                'qa_institution' => 'Ministry of Water and Energy QA Board',
                'compliance_score' => 92.00,
                'qa_status' => 'Certified Compliant',
            ]
        );

        // 5. Construction Ready Designs
        ConstructionReadyDesign::firstOrCreate(
            ['shelf_code' => 'CRD-2016-001'],
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
                'estimated_construction_etb' => 45000000.00,
                'command_area_ha' => 520.00,
                'shelf_entry_ethiopian_date' => '2016-04-10',
            ]
        );

        // 6. Professional Trainings
        ProfessionalTraining::firstOrCreate(
            ['training_code' => 'TRN-2016-001'],
            [
                'fiscal_year' => $fiscalYear,
                'zone' => $zoneName,
                'woreda' => $woredaName,
                'kebele' => $kebeleName,
                'zone_id' => $zoneId,
                'woreda_id' => $woredaId,
                'kebele_id' => $kebeleId,
                'training_status' => 'Completed',
                'course_title' => 'Hydraulic Design of Small Weirs and Canals',
                'discipline' => 'Civil & Hydraulic Engineering',
                'target_tier' => 'Zonal & Woreda Irrigation Engineers',
                'sponsoring_program' => 'Sustainable Agricultural Water Management (SAWM)',
                'training_venue' => 'Bahir Dar Agricultural Training Center',
                'training_duration_days' => 5,
                'male_participants' => 28,
                'female_participants' => 14,
                'lead_trainer' => 'Eng. Solomon Worku',
            ]
        );

        // 7. Agricultural Input Allocations
        InputAllocation::firstOrCreate(
            ['input_code' => 'INP-2016-001'],
            [
                'fiscal_year' => $fiscalYear,
                'zone' => $zoneName,
                'woreda' => $woredaName,
                'kebele' => $kebeleName,
                'zone_id' => $zoneId,
                'woreda_id' => $woredaId,
                'kebele_id' => $kebeleId,
                'status' => 'Pending',
                'irrigation_season' => 'Bega / Dry Season',
                'cropping_round' => 'Round 1',
                'input_name' => 'Certified High-Yield Wheat Seed (Kingbird)',
                'specification' => 'Certified Grade 1 Seed',
                'unit' => 'Quintals',
                'planned_target_qty' => 450.00,
                'covered_hectares' => 380.00,
                'funding_program' => 'National Wheat Initiative',
                'beneficiaries_male' => 420,
                'beneficiaries_female' => 190,
            ]
        );

        // 8. Construction Contracts
        $contract1 = ConstructionContract::firstOrCreate(
            ['contract_code' => 'CTR-2016-001'],
            [
                'scheme_name' => 'Ribb Main Canal Extension Package 2',
                'fiscal_year' => $fiscalYear,
                'zone' => $zoneName,
                'woreda' => $woredaName,
                'kebele' => $kebeleName,
                'zone_id' => $zoneId,
                'woreda_id' => $woredaId,
                'kebele_id' => $kebeleId,
                'construction_status' => 'Under Active Construction',
                'project_code' => 'PRJ-RIB-02',
                'scheme_type' => 'Gravity Canal Network',
                'funding_source' => 'Government Capital Budget',
                'contractor_name' => 'Amhara Water Works Construction Enterprise',
                'contractor_grade' => 'GC-1',
                'consultant_supervisor' => 'Water Works Design & Supervision Enterprise',
                'contract_sum_etb' => 78500000.00,
                'defect_liability_months' => 12,
                'physical_progress_pct' => 64.50,
                'financial_progress_pct' => 58.20,
                'command_area_ha' => 1200.00,
                'beneficiaries_male' => 840,
                'beneficiaries_female' => 460,
                'planned_progress_pct' => 70.00,
            ]
        );

        // 9. Construction Progress Logs
        ConstructionProgressLog::firstOrCreate(
            ['progress_log_code' => 'LOG-2016-001'],
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
                'health_status' => 'On Schedule',
                'planned_progress_pct' => 70.00,
                'physical_progress_pct' => 64.50,
                'financial_progress_pct' => 58.20,
                'weir_concreting_pct' => 95.00,
                'canal_excavation_pct' => 88.00,
                'canal_lining_km' => 14.50,
                'target_canal_lining_km' => 22.00,
                'gates_installed_count' => 18,
                'target_gates_count' => 24,
                'resident_engineer' => 'Eng. Dereje Mengistu',
            ]
        );

        // 10. Handover Certificates
        HandoverCertificate::firstOrCreate(
            ['handover_certificate_no' => 'HC-2016-001'],
            [
                'scheme_name' => 'Girana Diversion Headwork & Main Canal',
                'fiscal_year' => $fiscalYear,
                'zone' => $zoneName,
                'woreda' => $woredaName,
                'kebele' => $kebeleName,
                'zone_id' => $zoneId,
                'woreda_id' => $woredaId,
                'kebele_id' => $kebeleId,
                'handover_status' => 'Substantial Completion Handed Over',
                'contract_code' => 'CTR-2015-089',
                'recipient_wua' => 'Girana Valley Water Users Association',
                'command_area_ha' => 450.00,
                'beneficiaries_male' => 310,
                'beneficiaries_female' => 170,
                'contract_sum_etb' => 32000000.00,
                'retention_money_etb' => 1600000.00,
                'defect_liability_months' => 12,
                'snag_items_count' => 3,
                'handover_committee_lead' => 'Eng. Getachew Bekele',
            ]
        );

        // 11. Funding Allocations
        FundingAllocation::firstOrCreate(
            ['funding_code' => 'FND-2016-001'],
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
                'funding_program' => 'National Agricultural Growth Program (AGP-II)',
                'donor_account_ref' => 'IDA-CR-5890-ET',
                'total_allocated_budget_etb' => 78500000.00,
                'cumulative_disbursed_etb' => 45687000.00,
            ]
        );

        // 12. Land Benefit Verifications
        LandBenefitVerification::firstOrCreate(
            ['benefit_code' => 'BNF-2016-001'],
            [
                'scheme_name' => 'Koga Irrigation Block 3 Agronomic Verification',
                'fiscal_year' => $fiscalYear,
                'zone' => $zoneName,
                'woreda' => $woredaName,
                'kebele' => $kebeleName,
                'zone_id' => $zoneId,
                'woreda_id' => $woredaId,
                'kebele_id' => $kebeleId,
                'benefit_status' => 'Verified & Operational',
                'contract_code' => 'CTR-2016-001',
                'scheme_type' => 'Smallholder Gravity Diversion',
                'funding_source' => 'Regional Agriculture Bureau',
                'planned_command_ha' => 450.00,
                'actual_developed_ha' => 420.00,
                'operational_cultivated_ha' => 395.00,
                'beneficiaries_male' => 280,
                'beneficiaries_female' => 140,
                'primary_crops_cultivated' => 'Wheat, Maize, Onion, Potato',
                'cropping_intensity_ratio' => 1.85,
                'verifying_agronomist' => 'Agronomist Yonas Assefa',
            ]
        );

        // 13. Water Users Associations (WUAs)
        $wua1 = WaterUsersAssociation::firstOrCreate(
            ['wua_reg_code' => 'WUA-2016-001'],
            [
                'scheme_name' => 'Koga Primary Canal Block-4 WUA',
                'fiscal_year' => $fiscalYear,
                'zone' => $zoneName,
                'woreda' => $woredaName,
                'kebele' => $kebeleName,
                'zone_id' => $zoneId,
                'woreda_id' => $woredaId,
                'kebele_id' => $kebeleId,
                'wua_name' => 'Koga Selam Water Users Association',
                'governance_status' => 'Fully Legally Registered',
                'establishment_type' => 'Proclamation 841/2014 Framework',
                'command_area_ha' => 380.00,
                'members_male' => 260,
                'members_female' => 135,
                'chairperson_name' => 'Ato Alemayehu Molla',
                'water_master_name' => 'Ato Belayneh Gashaw',
                'committee_male' => 5,
                'committee_female' => 3,
                'sub_ketenas_count' => 6,
                'distribution_regime' => 'Rotational Warabandi Schedule',
                'annual_water_fee_etb_ha' => 450.00,
                'fee_collection_rate_pct' => 88.50,
                'registration_decree_ref' => 'REG/WUA/2016/044',
                'bylaw_charter_status' => 'Ratified by General Assembly',
            ]
        );

        // 14. Association Audits
        AssociationAudit::firstOrCreate(
            ['audit_code' => 'ADT-2016-001'],
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
                'audit_verdict' => 'Satisfactory / Clean Audit',
                'audit_scope' => 'Financial Accounts & By-Law Compliance',
                'governance_grade' => 'Grade A',
                'overall_health_score' => 89.00,
                'audited_revenue_etb' => 171000.00,
                'audited_expense_etb' => 142000.00,
                'lead_auditor' => 'Ato Mulatu Gizaw (Senior WUA Cooperative Auditor)',
            ]
        );

        // 15. Association Trainings
        AssociationTraining::firstOrCreate(
            ['training_code' => 'WTRN-2016-001'],
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
                'training_module' => 'Water Scheduling, Conflict Resolution & Asset O&M',
                'facilitator_channel' => 'Woreda Irrigation & Cooperative Office',
                'training_venue' => 'Woreda Meeting Hall',
                'training_duration_days' => 3,
                'exec_leaders_male' => 7,
                'exec_leaders_female' => 3,
                'members_male' => 35,
                'members_female' => 18,
                'lead_facilitator' => 'W/ro Selamawit Alemu',
            ]
        );

        // 16. Scheme Maintenance
        SchemeMaintenance::firstOrCreate(
            ['scheme_name' => 'Mecha Secondary Canal Desilting Campaign'],
            [
                'fiscal_year' => $fiscalYear,
                'zone' => $zoneName,
                'woreda' => $woredaName,
                'kebele' => $kebeleName,
                'zone_id' => $zoneId,
                'woreda_id' => $woredaId,
                'kebele_id' => $kebeleId,
                'operation_status' => 'Routine Maintenance Executed',
                'canal_type' => 'Secondary Unlined Canal',
                'wua_name' => $wua1->wua_name,
                'intervention_types' => 'Silt Removal, Weed Clearing, Embankment Compaction',
                'repaired_cleaned_km' => 8.20,
                'command_area_protected_ha' => 380.00,
                'funding_source' => 'WUA Community Labor & O&M Fund',
                'lead_coordinator' => 'Ato Belayneh Gashaw (Water Master)',
            ]
        );

        // 17. Irrigated Area Utilization
        IrrigatedArea::firstOrCreate(
            ['utilization_code' => 'IRR-2016-001'],
            [
                'scheme_name' => 'Raya Kobo Modern Command Scheme',
                'fiscal_year' => $fiscalYear,
                'zone' => $zoneName,
                'woreda' => $woredaName,
                'kebele' => $kebeleName,
                'zone_id' => $zoneId,
                'woreda_id' => $woredaId,
                'kebele_id' => $kebeleId,
                'water_adequacy_status' => 'Sufficient Water Availability',
                'scheme_code' => 'SCH-RAY-01',
                'cropping_round' => 'Season 1 / Bega',
                'wua_name' => 'Raya Valley Farmer Association',
                'land_modality' => 'Smallholder Individual Holdings',
                'expansion_method' => 'Gravity Canal Infiltration Basin',
                'planned_command_ha' => 450.00,
                'actual_irrigated_ha' => 415.50,
                'farmers_male' => 290,
                'farmers_female' => 145,
                'dominant_crops' => 'Irrigated Wheat, Onion, Tomato',
                'verifying_expert' => 'Agronomist Mesfin Girma',
            ]
        );

        // 18. Water Sources & Pumping Infrastructure
        WaterSource::firstOrCreate(
            ['scheme_name' => 'Borkena Deep Groundwater Production Well'],
            [
                'fiscal_year' => $fiscalYear,
                'zone' => $zoneName,
                'woreda' => $woredaName,
                'kebele' => $kebeleName,
                'zone_id' => $zoneId,
                'woreda_id' => $woredaId,
                'kebele_id' => $kebeleId,
                'operational_status' => 'Fully Functional & Pumping',
                'wua_name' => 'Borkena Valley Producers Union',
                'technology_type' => 'Solar Hybrid Submersible Pump',
                'equipment_units_count' => 2,
                'discharge_capacity_liters_sec' => 35.00,
                'command_area_served_ha' => 85.00,
                'energy_source' => 'Solar Photovoltaic with Grid Backup',
                'farmers_male' => 64,
                'farmers_female' => 31,
                'installation_eth_year' => '2015',
            ]
        );

        // 19. Seasonal Production Records
        SeasonalProduction::firstOrCreate(
            ['production_code' => 'PRD-2016-001'],
            [
                'scheme_name' => 'Koga Block 2 Bega Wheat Harvest',
                'fiscal_year' => $fiscalYear,
                'zone' => $zoneName,
                'woreda' => $woredaName,
                'kebele' => $kebeleName,
                'zone_id' => $zoneId,
                'woreda_id' => $woredaId,
                'kebele_id' => $kebeleId,
                'harvest_status' => 'Harvest Completed & Threshed',
                'cropping_round' => 'Bega / Dry Season 2016',
                'crop_category' => 'Cereal Crops',
                'specific_crop' => 'Irrigated Bread Wheat',
                'cultivated_area_ha' => 320.00,
                'production_yield_quintals' => 12800.00,
                'farmers_male' => 240,
                'farmers_female' => 110,
                'verifying_agronomist' => 'Inspecting Officer Daniel Taye',
            ]
        );

        // 20. Highland Wheat Clusters
        HighlandWheatCluster::firstOrCreate(
            ['initiative_code' => 'HWC-2016-001'],
            [
                'scheme_name' => 'Gonder Highland Wheat Acceleration Block',
                'fiscal_year' => $fiscalYear,
                'zone' => $zoneName,
                'woreda' => $woredaName,
                'kebele' => $kebeleName,
                'zone_id' => $zoneId,
                'woreda_id' => $woredaId,
                'kebele_id' => $kebeleId,
                'verification_status' => 'Cluster Verified & Certified',
                'cropping_round' => 'Round 1 / 2016 Bega',
                'wheat_variety' => 'Kingbird / Ogolcho',
                'cluster_block_code' => 'BLK-HWC-04',
                'wheat_command_ha' => 280.00,
                'expected_yield_qt' => 11200.00,
                'farmers_male' => 195,
                'farmers_female' => 85,
                'lead_agronomist' => 'Cluster Coordinator Berhanu Zeleke',
            ]
        );
    }
}
