<?php

namespace Modules\Irrigation\Support\WaterUtilization;

/**
 * Controlled vocabularies of water sources & irrigation technologies.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class WaterSourceEnums
{
    public const TECHNOLOGIES = [
        'Modern River Diversion Weir (ዘመናዊ የወንዝ ጠለፋ)',
        'Traditional Brushwood Diversion (ባህላዊ የወንዝ ጠለፋ)',
        'Spring Development & Collection Chamber (ምንጭ ማጎልበት)',
        'Solar-Powered Pump (የፀሐይ ፓምፕ)',
        'Motorized Fuel Pump (ሞተር ፓምፕ)',
        'Centrifugal / CT Pump (CT ፓምፕ)',
        'Electric Grid Connected Pump',
        'Deep Borehole Well (ጥልቅ ዌል)',
        'Shallow Tube Well (ጥልቀት የሌለው ጉድጓድ)',
        'Hand-Dug Well (የእጅ ውሃ ጉድጓድ)',
        'Geomembrane-Lined Pond (ጀኦሜምብራን ሻሸ)',
        'Concrete-Lined Pond (ኮንክሪት ሻሸ)',
        'Community Earth Reservoir (የማህበረሰብ ኩሬ)',
    ];

    public const CATEGORIES = [
        'Surface Water & Gravity Diversion',
        'Pumping & Lift Technologies',
        'Groundwater Wells',
        'Storage Ponds & Linings',
    ];

    public const STATUSES = [
        'Functional & Operating',
        'Operating at Low Discharge',
        'Requires Maintenance / Spare Parts',
        'Under Installation',
    ];
}
