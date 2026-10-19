<?php

namespace Modules\Irrigation\Support\Construction;

use Modules\Irrigation\Models\Construction\ConstructionContract;
use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of construction/progress records (irrigation_construction_progress_logs).
 */
class ConstructionProgressLogDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Construction progress log',
            'code' => 'progress_log_code',
            'status' => ['field' => 'health_status', 'values' => ConstructionProgressLogEnums::HEALTH_STATUSES, 'default' => 'On Track'],
            'parent' => ['field' => 'contract_id', 'model' => ConstructionContract::class, 'required' => true, 'fiscal_year' => true],
            'dates' => ['reporting_ethiopian_date' => 'eth_'],
            'fields' => [
                'progress_log_code' => self::str(true, 50),
                'site_engineering_remarks' => self::text(),
            ] + ConstructionWbs::rules(),
            'computed' => [
                'contract_code' => 'string', 'project_code' => 'string', 'scheme_type' => 'string',
                'contract_sum_etb' => 'float', 'command_area_ha' => 'float', 'disbursed_sum_etb' => 'float',
                'variance_pct' => 'float',
            ],
        ];
    }
}
