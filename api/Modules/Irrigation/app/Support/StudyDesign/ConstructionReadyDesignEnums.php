<?php

namespace Modules\Irrigation\Support\StudyDesign;

/**
 * Controlled vocabularies of the construction-ready design shelf.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class ConstructionReadyDesignEnums
{
    public const STATUSES = [
        'Available on Shelf',
        'Packaging Tender Dossier',
        'Packaged & Tender Ready',
        'Handed Over to Construction',
        'Archived / Redesign Needed',
    ];

    public const HANDED_OVER = 'Handed Over to Construction';

    public const ARCHIVED = 'Archived / Redesign Needed';

    public const PROCUREMENT_METHODS = [
        'National Competitive Bidding (NCB)',
        'International Competitive Bidding (ICB)',
        'Regional Direct Contracting (Woreda / WUA)',
        'Force Account (Government Enterprise)',
    ];
}
