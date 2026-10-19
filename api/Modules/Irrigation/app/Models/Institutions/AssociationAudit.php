<?php

namespace Modules\Irrigation\Models\Institutions;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\Institutions\AssociationAuditDefinition;

/**
 * Model for AssociationAudit (irrigation_association_audits).
 */
class AssociationAudit extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_association_audits';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'audit_code',
        'scheme_name',
        'audit_verdict',
        'wua_id',
        'audit_ethiopian_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'audit_scope',
        'governance_grade',
        'overall_health_score',
        'audited_revenue_etb',
        'audited_expense_etb',
        'unaccounted_variance_etb',
        'lead_auditor',
        'audit_institution',
        'strengthening_interventions',
        'audit_history',
        'wua_reg_code',
        'wua_name',
        'command_area_ha',
        'total_members',
        'compliance_checklist',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'wua_id' => 'integer',
        'eth_day' => 'integer',
        'overall_health_score' => 'integer',
        'audited_revenue_etb' => 'decimal:2',
        'audited_expense_etb' => 'decimal:2',
        'unaccounted_variance_etb' => 'decimal:2',
        'audit_history' => 'array',
        'command_area_ha' => 'decimal:2',
        'total_members' => 'integer',
        'compliance_checklist' => 'array',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return AssociationAuditDefinition::class;
    }
}
