<?php

namespace Modules\Irrigation\Support\AgriculturalInputs;

/**
 * Controlled vocabularies of agricultural input allocations.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class InputAllocationEnums
{
    public const NAMES = ['Fertilizer', 'Improved Seed', 'Compost', 'Agro-Chemicals & Pesticides', 'Other Inputs'];

    public const UNITS = ['Quintals', 'Liters', 'Cubic Meters', 'Packets / Pieces'];

    public const SEASONS = ['Bega Irrigation', 'Meher Supplemental'];

    public const ROUNDS = ['Round 1', 'Round 2', 'Round 3', 'Highland Irrigated Wheat'];

    public const FUNDING = [
        'Regional Government Budget', 'Federal Government Budget', 'PACT Program', 'FSRP Support',
        'GCF (Green Climate Fund)', 'DRDIP Project', 'CREW Project', 'CRIPS Project', 'Community SWC Contribution',
    ];

    public const STATUSES = ['Pending', 'In Progress', 'Completed'];
}
