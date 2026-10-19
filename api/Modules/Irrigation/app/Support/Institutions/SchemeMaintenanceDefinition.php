<?php

namespace Modules\Irrigation\Support\Institutions;

use Illuminate\Validation\Rule;
use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of institutions/maintenance-cleaning records (irrigation_scheme_maintenances).
 */
class SchemeMaintenanceDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Scheme maintenance & cleaning activity',
            'code' => null,
            'status' => ['field' => 'operation_status', 'values' => SchemeMaintenanceEnums::STATUSES, 'default' => 'Completed'],
            'dates' => ['activity_ethiopian_date' => 'eth_'],
            'fields' => [
                'scheme_name' => self::str(),
                'canal_type' => self::in(SchemeMaintenanceEnums::CANAL_TYPES),
                'fiscal_year' => self::fiscalYear(),
                'wua_name' => self::str(),
                'intervention_types' => ['required', 'array', 'min:1'],
                'intervention_types.*' => ['string', Rule::in(SchemeMaintenanceEnums::INTERVENTIONS)],
                'repaired_cleaned_km' => self::num(true, 0.1),
                'command_area_protected_ha' => self::num(),
                'financial_cost_etb' => self::num(false),
                'mobilized_labor_male' => self::int(false),
                'mobilized_labor_female' => self::int(false),
                'funding_source' => self::in(SchemeMaintenanceEnums::FUND_SOURCES),
                'lead_coordinator' => self::str(),
                'field_remarks' => self::text(),
            ],
            'computed' => ['total_mobilized_labor' => 'int'],
        ];
    }
}
