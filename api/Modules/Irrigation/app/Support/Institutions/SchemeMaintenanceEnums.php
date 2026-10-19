<?php

namespace Modules\Irrigation\Support\Institutions;

/**
 * Controlled vocabularies of scheme maintenance & canal cleaning.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class SchemeMaintenanceEnums
{
    public const CANAL_TYPES = ['Modern Concrete Scheme (በዘመናዊ)', 'Traditional Earth Scheme (በባህላዊ)'];

    public const INTERVENTIONS = [
        'Seasonal Canal Silt Removal (የደለል ማንሳት ስራ)',
        'Aquatic Invasive Weed Clearance (የመጤና የውሃ ውስጥ አረም ማጽዳት)',
        'Canal Sediment Trap & Basin Flushing (የደለል ማጠራቀሚያ ገንዳ ማጽዳት)',
        'Post-Flood Emergency Debris Removal (የድንገተኛ ጎርፍ ቆሻሻ ማጽዳት)',
        'Canal Lining Masonry Crack Injection & Plastering (የስንጥቅ ጥገና)',
        'Headwork Weir Crest & Intake Gate Repair (የመጥለፊያ ግድብና በር ጥገና)',
        'Aqueduct & Flume Crossing Pipe Replacement (የቦይ ማስተላለፊያ ቱቦ መቀየር)',
        'Breached Embankment Gabion & Riprap Protection (የቦይ ዳርቻ ጋቢዮን መከላከል)',
        'Scour Sluice Basin Concrete Floor Rehabilitation',
        'Solar PV Array Cleaning & Wiring Maintenance',
        'Solar Surface/Submersible Pump Impeller Servicing',
        'Control Gate Spindle Lubrication & Seal Replacement',
    ];

    public const STATUSES = ['Completed', 'In Progress', 'Labor Mobilization', 'Damage Assessed'];

    public const FUND_SOURCES = [
        'WUA Internal O&M Reserve Fund (የማህበሩ የጥገና ፈንድ)',
        'Community Voluntary Labor Contribution (የህዝብ ጉልበት)',
        'Woreda Agriculture Maintenance Allocation',
        'Regional Emergency Scheme Rehabilitation Fund',
        'PACT / FSRP Community Scheme Grant',
    ];
}
