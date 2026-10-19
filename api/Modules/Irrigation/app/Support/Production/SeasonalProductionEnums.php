<?php

namespace Modules\Irrigation\Support\Production;

/**
 * Controlled vocabularies of seasonal crop production.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class SeasonalProductionEnums
{
    public const CROP_CATEGORIES = ['Cereals (አዝርዕት)', 'Pulses (ጥራጥሬ)', 'Vegetables (አትክልት)', 'Spices (ቅመማ ቅመም)', 'Fruits (ፍራፍሬ)'];

    public const STATUSES = [
        'Harvest Completed & Weighed',
        'Field Stand Verified',
        'Vegetative / Grain Filling',
        'Yield Loss Reported',
    ];
}
