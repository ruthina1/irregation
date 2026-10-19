<?php

namespace Modules\Irrigation\Services\Reports;

use Illuminate\Support\Collection;
use Modules\Irrigation\Models\IrrigationRecord;

/**
 * Base class for the Irrigation dashboards and Analytics & Reports pages.
 *
 * Every figure is computed from stored records for the requested fiscal year.
 * Metrics for which no record type exists in the module are returned as null
 * (never estimated), so the pages can show them as "not tracked".
 */
abstract class IrrigationReport
{
    protected const UNASSIGNED_ZONE = 'Unassigned';

    /** @var array<string, Collection<int, array<string, mixed>>> */
    private array $cache = [];

    /** @return array<string, mixed> */
    abstract public function build(?string $fiscalYear): array;

    /**
     * Serialised records of one feature for a fiscal year.
     *
     * @param  class-string<IrrigationRecord>  $model
     * @return Collection<int, array<string, mixed>>
     */
    protected function rows(string $model, ?string $fiscalYear): Collection
    {
        return $this->cache[$model.'|'.$fiscalYear] ??= $model::query()
            ->when($fiscalYear, fn ($q) => $q->where('fiscal_year', $fiscalYear))
            ->orderBy('id')->get()
            ->map(fn (IrrigationRecord $r) => $r->toApiArray());
    }

    /** @param  array<string, mixed>  $row */
    protected static function zoneOf(array $row): string
    {
        return filled($row['zone'] ?? null) ? (string) $row['zone'] : self::UNASSIGNED_ZONE;
    }

    protected static function sum(Collection $rows, string $field): float
    {
        return (float) $rows->sum(fn ($r) => (float) ($r[$field] ?? 0));
    }

    protected static function avg(Collection $rows, string $field): ?float
    {
        return $rows->isEmpty() ? null : round($rows->avg(fn ($r) => (float) ($r[$field] ?? 0)), 1);
    }

    protected static function pct(float $part, float $whole): float
    {
        return $whole > 0 ? round($part / $whole * 100, 1) : 0.0;
    }

    /**
     * Sorted list of zones present in any of the given row sets.
     *
     * @return list<string>
     */
    protected static function zones(Collection ...$sets): array
    {
        return collect($sets)->flatMap(fn (Collection $rows) => $rows->map(fn ($r) => self::zoneOf($r)))
            ->unique()->sort()->values()->all();
    }

    protected static function byZone(Collection $rows, string $zone): Collection
    {
        return $rows->filter(fn ($r) => self::zoneOf($r) === $zone)->values();
    }

    /**
     * @param  array<int|string, array<string, mixed>>  $rows
     * @return list<array<string, mixed>>
     */
    protected static function withKeys(array $rows): array
    {
        $rows = array_values($rows);

        return array_map(fn ($row, $i) => ['key' => (string) ($i + 1)] + $row, $rows, array_keys($rows));
    }
}
