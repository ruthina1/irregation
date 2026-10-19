<?php

namespace Modules\Irrigation\Support\Construction;

/**
 * Controlled vocabularies of completion & handover certificates.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class HandoverCertificateEnums
{
    public const STATUSES = [
        'Handed Over to Users',
        'DLP Completed & Retention Released',
        'Snag List Pending',
        'Wet Run Commissioned',
    ];
}
