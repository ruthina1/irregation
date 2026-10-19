<?php

namespace Modules\Irrigation\Support\Construction;

use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of construction/completion records (irrigation_handover_certificates).
 */
class HandoverCertificateDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'Project completion & handover certificate',
            'code' => 'handover_certificate_no',
            'status' => ['field' => 'handover_status', 'values' => HandoverCertificateEnums::STATUSES, 'default' => 'Handed Over to Users'],
            'dates' => ['provisional_handover_eth_date' => 'eth_'],
            'fields' => [
                'handover_certificate_no' => self::str(true, 50),
                'scheme_name' => self::str(),
                'contract_code' => self::str(true, 50),
                'project_code' => self::str(false, 50),
                'recipient_wua' => self::str(),
                'contractor_name' => self::str(false),
                'consultant_supervisor' => self::str(false),
                'command_area_ha' => self::num(),
                'beneficiaries_male' => self::int(),
                'beneficiaries_female' => self::int(),
                'contract_sum_etb' => self::num(),
                'retention_money_etb' => self::num(),
                'defect_liability_months' => self::int(true, 3, 36),
                'snag_items_count' => self::int(true, 0, 20),
                'handover_committee_lead' => self::str(),
                'handover_remarks' => self::text(),
            ],
            'transient' => self::checks(['check_wet_run', 'check_as_built', 'check_om_manual', 'check_wua_trained', 'check_snags_cleared', 'check_retention_released']),
            'computed' => ['total_beneficiaries' => 'int', 'dlp_expiry_eth_date' => 'string', 'protocol_checklist' => 'array'],
        ];
    }
}
