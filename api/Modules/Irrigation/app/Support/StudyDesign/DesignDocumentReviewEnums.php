<?php

namespace Modules\Irrigation\Support\StudyDesign;

/**
 * Controlled vocabularies of design document reviews.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class DesignDocumentReviewEnums
{
    public const MILESTONES = [
        'Inception Report Review Gate',
        'Mid-Term Interim Draft Review Gate',
        'Draft Final Engineering Review Gate',
        'Final Tender Dossier & BoQ Validation',
    ];

    public const VOLUMES = [
        'Volume I: Main Engineering & Feasibility Report',
        'Volume II: Hydrology & Water Resource Assessment',
        'Volume III: Geotechnical & Soil Investigation',
        'Volume IV: Hydraulic & Structural Design Calculations',
        'Volume V: Irrigation Agronomy & Command Area Layout',
        'Volume VI: Environmental & Social Impact Assessment (ESIA)',
        'Volume VII: Bill of Quantities (BoQ) & Tender Dossier',
    ];

    public const VERDICTS = [
        'Approved Without Comments',
        'Approved with Minor Comments',
        'Major Revisions Required',
        'Rejected / Incomplete',
        'Under Review',
    ];
}
