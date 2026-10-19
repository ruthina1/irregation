<?php

namespace Modules\Irrigation\Support\WaterUtilization;

/**
 * Controlled vocabularies of irrigated land utilization.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class IrrigatedAreaEnums
{
    public const LAND_MODALITIES = ['Existing Scheme Land (በነባር)', 'New Scheme Land (በአዲስ)'];

    public const EXPANSION_METHODS = [
        'Modern Conveyance Expansion (በዘመናዊ አውታር)',
        'Traditional Diversion Expansion (በባህላዊ ጠለፋ)',
        'No Expansion (Standard In-Command)',
    ];

    public const WATER_ADEQUACY_STATUSES = ['Optimal Water Supply', 'Moderate Water Stress', 'Critical Water Deficit'];
}
