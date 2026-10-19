<?php

namespace Modules\Irrigation\Support\Production;

/**
 * Controlled vocabularies of highland irrigated wheat clusters.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class HighlandWheatClusterEnums
{
    public const VARIETIES = ['Kakaba (ቀቀባ)', 'Danda’a (ዳንዳዓ)', 'Kingbird (ኪንግበርድ)', 'Ogolcho (ኦጎልቾ)', 'Hidase (ህዳሴ)', 'Lemu (ለሙ)'];

    public const STATUSES = [
        'Harvest Weighed & Warehoused',
        'Grain Ripening / Maturing',
        'Tillering & Stem Elongation',
        'Yield Loss Reported',
    ];
}
