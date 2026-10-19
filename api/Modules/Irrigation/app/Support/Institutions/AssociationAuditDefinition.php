<?php

namespace Modules\Irrigation\Support\Institutions;

use Modules\Irrigation\Models\Institutions\WaterUsersAssociation;
use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of institutions/assessment-audit records (irrigation_association_audits).
 */
class AssociationAuditDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => 'WUA strengthening audit',
            'code' => 'audit_code',
            'generate' => 'AUD',
            'status' => ['field' => 'audit_verdict', 'values' => AssociationAuditEnums::VERDICTS, 'default' => 'Audit In Progress', 'required' => true],
            'parent' => ['field' => 'wua_id', 'model' => WaterUsersAssociation::class, 'required' => true, 'locked' => true],
            'dates' => ['audit_ethiopian_date' => 'eth_'],
            'fields' => [
                'fiscal_year' => self::fiscalYear(),
                'audit_scope' => self::in(AssociationAuditEnums::SCOPES),
                'governance_grade' => self::in(AssociationAuditEnums::GOVERNANCE_GRADES),
                'overall_health_score' => self::int(true, 0, 100),
                'audited_revenue_etb' => self::num(),
                'audited_expense_etb' => self::num(),
                'unaccounted_variance_etb' => self::num(false),
                'lead_auditor' => self::str(),
                'audit_institution' => self::str(false),
                'strengthening_interventions' => self::text(),
            ],
            'transient' => self::checks(['check_assembly', 'check_bank', 'check_receipts', 'check_bylaws', 'check_disputes', 'check_assets']),
            'server' => ['audit_history' => []],
            'server_types' => ['audit_history' => 'array'],
            'computed' => [
                'wua_reg_code' => 'string', 'wua_name' => 'string', 'command_area_ha' => 'float',
                'total_members' => 'int', 'compliance_checklist' => 'array',
            ],
        ];
    }
}
