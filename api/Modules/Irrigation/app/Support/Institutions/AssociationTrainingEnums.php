<?php

namespace Modules\Irrigation\Support\Institutions;

/**
 * Controlled vocabularies of association capacity-building trainings.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class AssociationTrainingEnums
{
    public const MODULES = [
        'Water Distribution Scheduling & Rotational Rosters (የውሃ ክፍፍል ተራ)',
        'WUA By-Law Enforcement & Dispute Resolution (ደንብና መመሪያ ማስከበር)',
        'Water Fee Tariff Setting, Collection & Cashbook Accounting',
        'Participatory Scheme Operation & Minor Canal Maintenance',
        'Water Users Groups (Ketenas) Leadership & Coordination',
        'Gender Inclusion & Female Farmer Empowerment in Irrigation',
    ];

    public const TARGET_GROUPS = [
        'WUA Executive Committee Leaders',
        'Water Masters & Tertiary Distributors',
        'General Farmer Members',
        'Control & Dispute Committee',
    ];

    public const STATUSES = ['Completed', 'In Session', 'Scheduled', 'Postponed'];

    public const FACILITATORS = [
        'Woreda Agriculture Office Extension Team (በባለሙያ)',
        'Zonal Cooperative Promotion Directorate (በባለሙያ)',
        'PACT Program Community Capacity Fund',
        'FSRP Community Irrigation Strengthening Component',
        'DRDIP Project Social Development Fund',
        'Regional Water Bureau Technical Assistance Unit',
    ];
}
