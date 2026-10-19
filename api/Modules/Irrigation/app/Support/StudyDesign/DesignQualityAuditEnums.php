<?php

namespace Modules\Irrigation\Support\StudyDesign;

/**
 * Controlled vocabularies of design quality-assurance audits.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class DesignQualityAuditEnums
{
    public const DOMAINS = [
        'Full Comprehensive Multi-Disciplinary QA',
        'Headwork Structural & Hydrological Audit',
        'Main Conveyance & Distribution System Audit',
        'Geotechnical Foundation & Dam Safety Audit',
        'Environmental & Social Safeguards (ESIA) Audit',
    ];

    public const STATUSES = [
        'Certified QA Passed',
        'Conditional Clearance',
        'Rectifications Required',
        'Rejected Non-Compliant',
        'Under QA Audit',
    ];

    public const CERTIFIED = 'Certified QA Passed';
}
