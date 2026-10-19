<?php

namespace Modules\Irrigation\Support\Construction;

/**
 * Controlled vocabularies of construction contracts (projects).
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class ConstructionContractEnums
{
    public const CONTRACTOR_GRADES = [
        'Water Works General Contractor (WWGC - Grade 1)',
        'Water Works General Contractor (WWGC - Grade 2 to 4)',
        'General Contractor (GC - Grade 1 to 3)',
        'Woreda / Community Force Account (ቀጥታ አፈፃፀም)',
        'Specialized Electro-Mechanical Contractor',
    ];

    public const STATUSES = [
        'Mobilization & Site Handover',
        'Active Construction',
        'Headwork Completed',
        'Substantially Completed',
        'Handed Over to Users',
        'Suspended / Delayed',
    ];

    public const HANDED_OVER = 'Handed Over to Users';

    public const HEALTH_STATUSES = ['On Track', 'Minor Delay', 'Critical Delay', 'Ahead of Schedule'];
}
