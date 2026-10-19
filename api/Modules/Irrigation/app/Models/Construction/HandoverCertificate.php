<?php

namespace Modules\Irrigation\Models\Construction;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\Construction\HandoverCertificateDefinition;

/**
 * Model for HandoverCertificate (irrigation_handover_certificates).
 */
class HandoverCertificate extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_handover_certificates';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'handover_certificate_no',
        'scheme_name',
        'handover_status',
        'provisional_handover_eth_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'contract_code',
        'project_code',
        'recipient_wua',
        'contractor_name',
        'consultant_supervisor',
        'command_area_ha',
        'beneficiaries_male',
        'beneficiaries_female',
        'contract_sum_etb',
        'retention_money_etb',
        'defect_liability_months',
        'snag_items_count',
        'handover_committee_lead',
        'handover_remarks',
        'total_beneficiaries',
        'dlp_expiry_eth_date',
        'protocol_checklist',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'eth_day' => 'integer',
        'command_area_ha' => 'decimal:2',
        'beneficiaries_male' => 'integer',
        'beneficiaries_female' => 'integer',
        'contract_sum_etb' => 'decimal:2',
        'retention_money_etb' => 'decimal:2',
        'defect_liability_months' => 'integer',
        'snag_items_count' => 'integer',
        'total_beneficiaries' => 'integer',
        'protocol_checklist' => 'array',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return HandoverCertificateDefinition::class;
    }
}
