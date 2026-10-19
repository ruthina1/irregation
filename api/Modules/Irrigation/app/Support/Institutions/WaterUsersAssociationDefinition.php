<?php

namespace Modules\Irrigation\Support\Institutions;

use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Fields and validation of institutions/water-users-associations records (irrigation_water_users_associations).
 */
class WaterUsersAssociationDefinition extends IrrigationDefinition
{
    protected static function config(): array
    {
        return [
            'label' => "Water users' association",
            'code' => 'wua_reg_code',
            'status' => ['field' => 'governance_status', 'values' => WaterUsersAssociationEnums::GOVERNANCE_STATUSES, 'default' => 'Active & Fully Functional'],
            'dates' => ['establishment_eth_date' => 'eth_'],
            'fields' => [
                'wua_reg_code' => self::str(true, 50),
                'wua_name' => self::str(),
                'scheme_name' => self::str(),
                'contract_code' => self::str(false, 50),
                'establishment_type' => self::in(WaterUsersAssociationEnums::TYPES),
                'command_area_ha' => self::num(),
                'members_male' => self::int(),
                'members_female' => self::int(),
                'chairperson_name' => self::str(),
                'water_master_name' => self::str(),
                'committee_male' => self::int(),
                'committee_female' => self::int(),
                'sub_ketenas_count' => self::int(true, 1, 30),
                'distribution_regime' => self::in(WaterUsersAssociationEnums::DISTRIBUTION_REGIMES),
                'annual_water_fee_etb_ha' => self::num(),
                'fee_collection_rate_pct' => self::num(true, 0, 100),
                'bank_account_balance_etb' => self::num(false),
                'registration_decree_ref' => self::str(),
                'bylaw_charter_status' => self::in(WaterUsersAssociationEnums::BYLAW_STATUSES),
                'governance_remarks' => self::text(),
            ],
            'computed' => ['total_members' => 'int', 'committee_members_count' => 'int', 'project_code' => 'string'],
        ];
    }
}
