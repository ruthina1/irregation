<?php

namespace Modules\Irrigation\Support\Construction;

/**
 * Controlled vocabularies of developed-land beneficiary verifications.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class LandBenefitVerificationEnums
{
    public const STATUSES = [
        'Fully Operational',
        'Partially Irrigated',
        'Command Developed (Pre-Watering)',
        'Under Land Levelling',
    ];
}
