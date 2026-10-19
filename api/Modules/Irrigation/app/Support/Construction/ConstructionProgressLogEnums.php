<?php

namespace Modules\Irrigation\Support\Construction;

/**
 * Controlled vocabularies of construction progress logs.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class ConstructionProgressLogEnums
{
    public const HEALTH_STATUSES = ['On Track', 'Minor Delay', 'Critical Delay', 'Ahead of Schedule', 'Substantially Completed'];
}
