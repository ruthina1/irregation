<?php

namespace Modules\Irrigation\Models\Institutions;

use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\Institutions\WaterUsersAssociationDefinition;

/**
 * Model for WaterUsersAssociation (irrigation_water_users_associations).
 */
class WaterUsersAssociation extends IrrigationRecord
{
    use SoftDeletes;

    protected $table = 'irrigation_water_users_associations';

    protected $fillable = [
        'fiscal_year',
        'zone',
        'woreda',
        'kebele',
        'zone_id',
        'woreda_id',
        'kebele_id',
        'wua_reg_code',
        'scheme_name',
        'governance_status',
        'establishment_eth_date',
        'eth_month',
        'eth_day',
        'eth_year',
        'wua_name',
        'contract_code',
        'establishment_type',
        'command_area_ha',
        'members_male',
        'members_female',
        'chairperson_name',
        'water_master_name',
        'committee_male',
        'committee_female',
        'sub_ketenas_count',
        'distribution_regime',
        'annual_water_fee_etb_ha',
        'fee_collection_rate_pct',
        'bank_account_balance_etb',
        'registration_decree_ref',
        'bylaw_charter_status',
        'governance_remarks',
        'total_members',
        'committee_members_count',
        'project_code',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'zone_id' => 'integer',
        'woreda_id' => 'integer',
        'kebele_id' => 'integer',
        'eth_day' => 'integer',
        'command_area_ha' => 'decimal:2',
        'members_male' => 'integer',
        'members_female' => 'integer',
        'committee_male' => 'integer',
        'committee_female' => 'integer',
        'sub_ketenas_count' => 'integer',
        'annual_water_fee_etb_ha' => 'decimal:2',
        'fee_collection_rate_pct' => 'decimal:2',
        'bank_account_balance_etb' => 'decimal:2',
        'total_members' => 'integer',
        'committee_members_count' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public static function definitionClass(): string
    {
        return WaterUsersAssociationDefinition::class;
    }
}
