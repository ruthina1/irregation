<?php

namespace Modules\Irrigation\Support;

/**
 * Normalises loosely-shaped client input (location objects, comma-separated
 * lists, numeric strings) so it matches the stored representation.
 */
final class IrrigationInputNormalizer
{
    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function normalize(array $input): array
    {
        foreach (['zone', 'woreda', 'kebele', 'scheme_name', 'wua_name'] as $key) {
            if (isset($input[$key]) && is_array($input[$key])) {
                $input[$key] = self::extractName($input[$key]);
            }
        }

        foreach (['primary_crops_cultivated', 'intervention_types'] as $key) {
            if (isset($input[$key]) && is_string($input[$key])) {
                $input[$key] = array_values(array_filter(array_map('trim', explode(',', $input[$key]))));
            }
        }

        foreach (['eth_day', 'eth_start_day', 'eth_end_day'] as $key) {
            if (isset($input[$key]) && is_string($input[$key]) && ctype_digit($input[$key])) {
                $input[$key] = (int) $input[$key];
            }
        }

        return $input;
    }

    /** @param  array<string, mixed>  $value */
    private static function extractName(array $value): ?string
    {
        foreach (['name', 'title', 'kebele_name', 'woreda_name', 'zone_name'] as $key) {
            if (! empty($value[$key]) && is_string($value[$key])) {
                return $value[$key];
            }
        }

        return null;
    }
}
