<?php

namespace Modules\Irrigation\Tests\Feature;

/**
 * Valid request payloads, shaped like the ones the Irrigation pages submit.
 */
final class IrrigationPayloads
{
    private static int $seq = 0;

    public const CREATABLE = [
        'pipeline', 'study-design', 'document-review', 'quality-assurance', 'capacity-building', 'inputs',
        'construction/projects', 'construction/progress', 'construction/completion', 'construction/funding',
        'construction/benefits', 'institutions/water-users-associations', 'institutions/capacity-building',
        'institutions/maintenance-cleaning', 'water-utilization/irrigated-area', 'water-utilization/water-sources',
        'production/seasonal-production', 'production/highland-wheat',
    ];

    private static function code(string $prefix): string
    {
        return sprintf('%s-2019-%03d', $prefix, ++self::$seq);
    }

    private static function location(): array
    {
        return ['zone' => 'West Gojjam', 'woreda' => 'Mecha', 'kebele' => 'Kudur', 'zone_id' => 2, 'woreda_id' => 201, 'kebele_id' => 2001];
    }

    private static function date(string $prefix = 'eth_'): array
    {
        return [$prefix.'month' => 'Tikimt', $prefix.'day' => 20, $prefix.'year' => '2019 E.C.'];
    }

    public static function for(string $resource, IrrigationTestCase $test): array
    {
        $fy = ['fiscal_year' => '2019 E.C.'];

        return match ($resource) {
            'pipeline' => $fy + self::location() + [
                'pipeline_code' => self::code('PLN'), 'scheme_name' => 'Birr River Diversion',
                'initiative_source' => 'Woreda Agriculture Master Plan', 'water_source' => 'River Diversion Weir (ወንዝ ጠለፋ)',
                'priority_level' => 'High Priority', 'potential_area_ha' => 1250, 'estimated_budget_etb' => 45000000,
                'estimated_beneficiaries_male' => 900, 'estimated_beneficiaries_female' => 300, 'site_notes' => 'Perennial river.',
            ],
            'study-design' => $fy + self::location() + [
                'project_code' => self::code('IRR-STD'), 'project_name' => 'Koga Right Bank Scheme',
                'study_modality' => 'Consultant - New', 'water_source' => 'River Diversion Weir (ወንዝ ጠለፋ)',
                'study_stage' => 'Detailed Engineering Design', 'lead_consultant_or_office' => 'WWDSE',
                'study_cost_etb' => 2500000, 'command_area_hectares' => 800, 'beneficiaries_male' => 600,
                'beneficiaries_female' => 200, 'experts_trained_male' => 4, 'experts_trained_female' => 2,
                'is_construction_ready' => false,
            ],
            'document-review' => $fy + self::date() + [
                'project_id' => $test->makeParent('study-design'), 'review_code' => self::code('REV'),
                'submitting_entity' => 'WWDSE', 'command_area_ha' => 800,
                'review_milestone' => 'Draft Final Engineering Review Gate',
                'document_volume' => 'Volume IV: Hydraulic & Structural Design Calculations',
                'submission_version' => 'Draft Final (v1.0)', 'lead_reviewer' => 'Eng. Solomon', 'review_team_size' => 4,
                'overall_technical_score' => 86, 'check_hydrology' => true, 'check_structural' => true,
                'check_geotechnical' => true, 'check_agronomy' => true, 'check_esia' => false,
            ],
            'quality-assurance' => $fy + self::date() + [
                'project_id' => $test->makeParent('study-design'), 'qa_certificate_no' => self::code('QA-CERT'),
                'qa_domain' => 'Full Comprehensive Multi-Disciplinary QA', 'command_area_ha' => 800,
                'lead_qa_auditor' => 'Eng. Yohannes', 'qa_institution' => 'Regional QA Directorate', 'compliance_score' => 90,
                'check_hydrology' => true, 'check_structural' => true, 'check_geotech' => true,
                'check_seepage' => true, 'check_boq' => true, 'check_esia' => true,
            ],
            'capacity-building' => $fy + self::date() + [
                'zone' => 'West Gojjam', 'zone_id' => 2, 'training_code' => self::code('TRN'),
                'course_title' => 'Weir design refresher', 'discipline' => 'Hydraulic & Structural Design of Diversion Weirs',
                'target_tier' => 'Zonal Water & Irrigation Department Engineers', 'sponsoring_program' => 'Regional Government Training Budget',
                'training_venue' => 'Bahir Dar', 'training_duration_days' => 5, 'male_participants' => 20,
                'female_participants' => 8, 'lead_trainer' => 'Dr. Abebe',
            ],
            'inputs' => $fy + self::location() + [
                'irrigation_season' => 'Bega Irrigation', 'cropping_round' => 'Round 1', 'input_code' => self::code('INP'),
                'input_name' => 'Fertilizer', 'specification' => 'DAP', 'unit' => 'Quintals', 'planned_target_qty' => 100,
                'covered_hectares' => 50, 'funding_program' => 'Regional Government Budget',
                'beneficiaries_male' => 40, 'beneficiaries_female' => 10,
            ],
            'construction/projects' => $fy + self::location() + self::date('eth_start_') + self::date('eth_end_') + [
                'scheme_name' => 'Koga Right Bank Scheme', 'contract_code' => self::code('CNTR'), 'project_code' => self::code('IRR-STD'),
                'scheme_type' => 'New Construction', 'funding_source' => 'PACT Program (በPACT በጀት)',
                'contractor_name' => 'Abay Construction', 'contractor_grade' => 'Water Works General Contractor (WWGC - Grade 1)',
                'consultant_supervisor' => 'WWDSE', 'contract_sum_etb' => 100000000, 'defect_liability_months' => 12,
                'physical_progress_pct' => 0, 'command_area_ha' => 800, 'beneficiaries_male' => 600, 'beneficiaries_female' => 200,
            ],
            'construction/progress' => self::date() + [
                'contract_id' => $test->makeParent('construction/projects'), 'progress_log_code' => self::code('PRG'),
                'planned_progress_pct' => 50, 'physical_progress_pct' => 30, 'financial_progress_pct' => 25,
                'weir_concreting_pct' => 40, 'canal_excavation_pct' => 30, 'canal_lining_km' => 2,
                'target_canal_lining_km' => 10, 'gates_installed_count' => 1, 'target_gates_count' => 6,
                'resident_engineer' => 'Eng. Kebede',
            ],
            'construction/completion' => self::location() + self::date() + [
                'handover_certificate_no' => self::code('HND-CERT'), 'scheme_name' => 'Koga Right Bank Scheme',
                'contract_code' => 'CNTR-NONE', 'recipient_wua' => 'Koga WUA', 'command_area_ha' => 800,
                'beneficiaries_male' => 600, 'beneficiaries_female' => 200, 'contract_sum_etb' => 100000000,
                'retention_money_etb' => 5000000, 'defect_liability_months' => 12, 'snag_items_count' => 0,
                'handover_committee_lead' => 'Commission Lead', 'check_wet_run' => true, 'check_as_built' => true,
                'check_om_manual' => true, 'check_wua_trained' => true, 'check_snags_cleared' => true, 'check_retention_released' => false,
            ],
            'construction/funding' => $fy + self::location() + [
                'funding_code' => self::code('FND'), 'scheme_name' => 'Koga Right Bank Scheme', 'contract_code' => 'CNTR-NONE',
                'project_code' => 'IRR-STD-NONE', 'funding_program' => 'PACT Program', 'donor_account_ref' => 'PACT/2019/07',
                'total_allocated_budget_etb' => 1000000, 'cumulative_disbursed_etb' => 0,
            ],
            'construction/benefits' => self::location() + self::date() + [
                'benefit_code' => self::code('BNF'), 'scheme_name' => 'Koga Right Bank Scheme', 'contract_code' => 'CNTR-NONE',
                'scheme_type' => 'New Construction', 'funding_source' => 'PACT Program (በPACT በጀት)',
                'planned_command_ha' => 800, 'actual_developed_ha' => 400, 'operational_cultivated_ha' => 350,
                'beneficiaries_male' => 300, 'beneficiaries_female' => 100, 'youth_beneficiaries_count' => 80,
                'primary_crops_cultivated' => ['Highland Irrigated Wheat (የደጋ ስንዴ)', 'Red Onion (ቀይ ሽንኩርት)'],
                'cropping_intensity_ratio' => 2.0, 'verifying_agronomist' => 'Ato Tesfaye',
            ],
            'institutions/water-users-associations' => self::location() + self::date() + [
                'wua_reg_code' => self::code('WUA'), 'wua_name' => 'Koga Water Users Association', 'scheme_name' => 'Koga Right Bank Scheme',
                'contract_code' => 'CNTR-NONE', 'establishment_type' => 'Newly Established WUA', 'command_area_ha' => 800,
                'members_male' => 500, 'members_female' => 150, 'chairperson_name' => 'Ato Alemu', 'water_master_name' => 'Ato Belay',
                'committee_male' => 5, 'committee_female' => 2, 'sub_ketenas_count' => 4,
                'distribution_regime' => '7-Day Rotational Block Schedule (የ7 ቀን ተራ)', 'annual_water_fee_etb_ha' => 500,
                'fee_collection_rate_pct' => 85, 'bank_account_balance_etb' => 120000, 'registration_decree_ref' => 'Decree 12/2019',
                'bylaw_charter_status' => 'Formally Enacted & Stamped',
            ],
            'institutions/capacity-building' => $fy + self::date() + [
                'wua_id' => $test->makeParent('institutions/water-users-associations'), 'training_code' => self::code('TRN-WUA'),
                'target_group' => 'WUA Executive Committee Leaders',
                'training_module' => 'Water Distribution Scheduling & Rotational Rosters (የውሃ ክፍፍል ተራ)',
                'facilitator_channel' => 'Woreda Agriculture Office Extension Team (በባለሙያ)', 'training_venue' => 'Merawi FTC',
                'training_duration_days' => 3, 'exec_leaders_male' => 5, 'exec_leaders_female' => 2,
                'members_male' => 25, 'members_female' => 10, 'lead_facilitator' => 'Ato Getachew',
            ],
            'institutions/maintenance-cleaning' => $fy + self::location() + self::date() + [
                'scheme_name' => 'Koga Right Bank Scheme', 'canal_type' => 'Modern Concrete Scheme (በዘመናዊ)',
                'wua_name' => 'Koga Water Users Association',
                'intervention_types' => ['Seasonal Canal Silt Removal (የደለል ማንሳት ስራ)'],
                'repaired_cleaned_km' => 5.5, 'command_area_protected_ha' => 600, 'financial_cost_etb' => 150000,
                'mobilized_labor_male' => 150, 'mobilized_labor_female' => 45,
                'funding_source' => 'WUA Internal O&M Reserve Fund (የማህበሩ የጥገና ፈንድ)', 'lead_coordinator' => 'Ato Belay',
            ],
            'water-utilization/irrigated-area' => $fy + self::location() + self::date() + [
                'utilization_code' => self::code('UTL'), 'scheme_name' => 'Koga Right Bank Scheme', 'scheme_code' => 'CNTR-NONE',
                'cropping_round' => 'Round 1 (1ኛ ዙር)', 'wua_name' => 'Koga Water Users Association',
                'land_modality' => 'New Scheme Land (በአዲስ)', 'expansion_method' => 'Modern Conveyance Expansion (በዘመናዊ አውታር)',
                'planned_command_ha' => 800, 'actual_irrigated_ha' => 600, 'expansion_area_ha' => 40,
                'farmers_male' => 400, 'farmers_female' => 120, 'dominant_crops' => 'Wheat, Onion', 'verifying_expert' => 'Ato Tesfaye',
            ],
            'water-utilization/water-sources' => $fy + self::location() + [
                'scheme_name' => 'Koga Right Bank Scheme', 'wua_name' => 'Koga Water Users Association',
                'technology_type' => 'Solar-Powered Pump (የፀሐይ ፓምፕ)', 'equipment_units_count' => 2,
                'discharge_capacity_liters_sec' => 45, 'command_area_served_ha' => 100, 'energy_source' => 'Solar Photovoltaic (PV)',
                'farmers_male' => 80, 'farmers_female' => 25, 'installation_eth_year' => '2019 E.C.',
            ],
            'production/seasonal-production' => $fy + self::location() + self::date() + [
                'production_code' => self::code('PRD'), 'scheme_name' => 'Koga Right Bank Scheme', 'cropping_round' => 'Round 1 (1ኛ ዙር)',
                'crop_category' => 'Vegetables (አትክልት)', 'specific_crop' => 'Red Onion (ቀይ ሽንኩርት)',
                'cultivated_area_ha' => 100, 'production_yield_quintals' => 4250, 'farmers_male' => 80, 'farmers_female' => 25,
                'verifying_agronomist' => 'Ato Tesfaye',
            ],
            'production/highland-wheat' => $fy + self::location() + self::date() + [
                'initiative_code' => self::code('WHT'), 'scheme_name' => 'Koga Right Bank Scheme', 'cropping_round' => 'Round 1 (1ኛ ዙር)',
                'wheat_variety' => 'Danda’a (ዳንዳዓ)', 'cluster_block_code' => 'Mecha-Cluster-12', 'wheat_command_ha' => 200,
                'expected_yield_qt' => 8400, 'farmers_male' => 180, 'farmers_female' => 55, 'lead_agronomist' => 'Dr. Mulu',
            ],
        };
    }
}
