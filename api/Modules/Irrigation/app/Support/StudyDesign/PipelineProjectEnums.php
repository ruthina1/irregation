<?php

namespace Modules\Irrigation\Support\StudyDesign;

/**
 * Controlled vocabularies of pipeline (project identification) records.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class PipelineProjectEnums
{
    public const SOURCES = [
        'Community Petition & Demand (የአርሶ አደር ጥያቄ)',
        'Woreda Agriculture Master Plan',
        'Integrated Watershed Catchment Scouting',
        'Regional Water Basin Survey',
        'Donor & Program Scouting (PACT/FSRP/GCF)',
    ];

    public const WATER_SOURCES = [
        'River Diversion Weir (ወንዝ ጠለፋ)',
        'Micro-Earth Dam / Reservoir (የመስኖ ግድብ)',
        'Spring Development & Collection (ምንጭ ማጎልበት)',
        'Groundwater Shallow / Deep Wells (ጥልቅ/እጅ ጉድጓድ)',
        'River Pumping Scheme (Solar / Electric)',
    ];

    public const STATUSES = [
        'Initial Pipeline Identification',
        'Field Reconnaissance Completed',
        'Hydrologically Feasible',
        'Approved for Detailed Study & Design',
        'Infeasible / Deferred',
    ];

    public const APPROVED = 'Approved for Detailed Study & Design';

    public const PRIORITY_LEVELS = ['High Priority', 'Medium Priority', 'Low Priority'];
}
