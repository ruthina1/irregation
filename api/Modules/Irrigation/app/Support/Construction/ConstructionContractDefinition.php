<?php

namespace Modules\Irrigation\Support\Construction;

use Modules\Irrigation\Support\IrrigationDefinition;
use Modules\Irrigation\Support\IrrigationEnums;

/**
 * Fields and validation of construction/projects records (irrigation_construction_contracts).
 */
class ConstructionContractDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Construction contract',
            'code' => 'contract_code',
            'status' => ['field' => 'construction_status', 'values' => ConstructionContractEnums::STATUSES, 'default' => 'Mobilization & Site Handover'],
            'dates' => ['contract_signing_eth_date' => 'eth_start_', 'planned_completion_eth_date' => 'eth_end_'],
            'fields' => [
                'contract_code' => self::str(true, 50),
                'project_code' => self::str(true, 50),
                'scheme_name' => self::str(),
                'scheme_type' => self::in(IrrigationEnums::SCHEME_TYPES),
                'funding_source' => self::in(IrrigationEnums::FUNDING_SOURCES),
                'contractor_name' => self::str(),
                'contractor_grade' => self::in(ConstructionContractEnums::CONTRACTOR_GRADES),
                'consultant_supervisor' => self::str(),
                'contract_sum_etb' => self::num(),
                'defect_liability_months' => self::int(true, 3, 36),
                'physical_progress_pct' => self::num(true, 0, 100),
                'command_area_ha' => self::num(),
                'beneficiaries_male' => self::int(),
                'beneficiaries_female' => self::int(),
                'site_progress_notes' => self::text(),
            ],
            'server' => [
                'disbursed_sum_etb' => 0, 'financial_progress_pct' => 0, 'planned_progress_pct' => null,
                'health_status' => 'On Track', 'weir_concreting_pct' => 0, 'canal_excavation_pct' => 0,
                'canal_lining_km' => 0, 'target_canal_lining_km' => null, 'gates_installed_count' => 0,
                'target_gates_count' => null, 'resident_engineer' => null, 'reporting_ethiopian_date' => null,
            ],
            'server_types' => [
                'disbursed_sum_etb' => 'float', 'financial_progress_pct' => 'float', 'planned_progress_pct' => 'float',
                'weir_concreting_pct' => 'float', 'canal_excavation_pct' => 'float', 'canal_lining_km' => 'float',
                'target_canal_lining_km' => 'float', 'gates_installed_count' => 'int', 'target_gates_count' => 'int',
            ],
            'computed' => ['total_beneficiaries' => 'int'],
            'presented' => ['wua_name' => 'string'],
        ];
    }
}
