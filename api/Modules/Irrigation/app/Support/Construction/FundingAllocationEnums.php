<?php

namespace Modules\Irrigation\Support\Construction;

/**
 * Controlled vocabularies of project funding allocations.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class FundingAllocationEnums
{
    public const PROGRAMS = [
        'Regional Government Budget', 'Federal Government Budget', 'PACT Program', 'FSRP Program',
        'Lease / Direct Support', 'GCF (Climate Fund)', 'DRDIP Project', 'CREW Project', 'CRIPS Project',
    ];

    /**
     * Construction-project funding labels (text before the Amharic suffix) that do not
     * match a financing-program value one-to-one. Used to normalise lookups.
     */
    public const PROGRAM_ALIASES = [
        'Regional Government Capital Budget' => 'Regional Government Budget',
        'Lease / Direct Support Financing' => 'Lease / Direct Support',
        'Green Climate Fund (GCF)' => 'GCF (Climate Fund)',
        'Green Climate Fund' => 'GCF (Climate Fund)',
    ];

    public const STATUSES = ['Active Disbursement', 'Fully Disbursed', 'Funds Committed', 'Disbursement Paused'];
}
