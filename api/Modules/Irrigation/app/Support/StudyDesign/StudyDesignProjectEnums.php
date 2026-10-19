<?php

namespace Modules\Irrigation\Support\StudyDesign;

/**
 * Controlled vocabularies of study & design projects.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class StudyDesignProjectEnums
{
    public const MODALITIES = [
        'Consultant - Existing', 'Consultant - New', 'Program-Led',
        'In-House Regional', 'In-House Zonal', 'In-House Woreda',
    ];

    public const STAGES = [
        'Preliminary Identification & Pipeline',
        'Feasibility & Hydrology Study',
        'Detailed Engineering Design',
        'Design Completed (Construction-Ready)',
    ];

    public const WATER_SOURCES = [
        'River Diversion Weir (ወንዝ ጠለፋ)',
        'Micro-Earth Dam / Reservoir (የመስኖ ግድብ)',
        'Spring Development & Collection Chamber (ምንጭ ማጎልበት)',
        'Shallow / Deep Groundwater Wells (ጥልቅ/እጅ ጉድጓድ)',
        'River Pumping Scheme (Solar / Electric Pump)',
    ];

    public const REVIEW_STATUSES = [
        'Pending Document Review',
        'Under Multi-Disciplinary Review',
        'Reviewed & Verified',
        'Revisions Required',
    ];

    public const QA_STATUSES = [
        'Pending QA Audit',
        'Quality Assured (Certified Passed)',
        'Rectifications Required',
    ];

    public const QA_PASSED = 'Quality Assured (Certified Passed)';
}
