<?php

namespace Modules\Irrigation\Support\Institutions;

/**
 * Controlled vocabularies of water users' associations.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class WaterUsersAssociationEnums
{
    public const TYPES = ['Newly Established WUA', 'Strengthened Existing WUA', 'Traditional Irrigation Group'];

    public const GOVERNANCE_STATUSES = [
        'Active & Fully Functional',
        'Moderate Functionality',
        'Weak Governance',
        'Under Establishment',
    ];

    public const DISTRIBUTION_REGIMES = [
        '7-Day Rotational Block Schedule (የ7 ቀን ተራ)',
        '10-Day Rotational Block Schedule (የ10 ቀን ተራ)',
        '14-Day Rotational Block Schedule (የ14 ቀን ተራ)',
        'Continuous Flow by Demand (ቀጣይ ፍሰት)',
        'Night Storage / Peak Hour Scheduling',
    ];

    public const BYLAW_STATUSES = [
        'Formally Enacted & Stamped',
        'Draft Bylaws Under Review',
        'Draft Bylaws Under Community Review',
    ];
}
