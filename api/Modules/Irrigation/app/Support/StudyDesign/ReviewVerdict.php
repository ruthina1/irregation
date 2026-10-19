<?php

namespace Modules\Irrigation\Support\StudyDesign;

/**
 * Interpretation of design document review verdicts.
 */
final class ReviewVerdict
{
    public static function isApproved(?string $verdict): bool
    {
        return $verdict !== null && str_contains($verdict, 'Approved');
    }

    public static function requiresRevision(?string $verdict): bool
    {
        return in_array($verdict, ['Major Revisions Required', 'Rejected / Incomplete'], true);
    }
}
