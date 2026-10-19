<?php

namespace Modules\Irrigation\Support\StudyDesign;

/**
 * Controlled vocabularies of professional capacity-building trainings.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class ProfessionalTrainingEnums
{
    public const DISCIPLINES = [
        'Hydrology & Catchment Runoff Modeling (HEC-RAS / GIS)',
        'Hydraulic & Structural Design of Diversion Weirs',
        'Geotechnical Foundation Testing & Seepage Analysis',
        'Solar-Powered Irrigation Engineering & Pump Sizing',
        'Irrigation Canal Network Layout & Water Duty Sizing',
        'Environmental & Social Safeguards (ESIA) in Irrigation',
        'Bill of Quantities (BoQ) & Standard Tender Documentation',
    ];

    public const TIERS = [
        'Regional Design Bureau Senior Specialists',
        'Zonal Water & Irrigation Department Engineers',
        'Woreda Irrigation & Agricultural Extension Experts',
        'Multi-Disciplinary Design Review Committee Members',
        'Joint Regional & University Research Teams',
    ];

    public const SPONSORS = [
        'Regional Government Training Budget',
        'PACT Program Capacity Fund',
        'FSRP Institutional Strengthening Component',
        'Green Climate Fund (GCF) Readiness',
        'DRDIP Project Technical Support',
    ];

    public const STATUSES = ['Completed', 'In Progress', 'Scheduled', 'Postponed', 'Cancelled'];
}
