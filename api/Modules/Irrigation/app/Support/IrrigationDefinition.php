<?php

namespace Modules\Irrigation\Support;

use Illuminate\Validation\Rule;

/**
 * Base class for the field definition of one Irrigation feature.
 *
 * Each feature (pipeline, study design, construction contract, ...) has its own
 * subclass describing:
 *  - label     human-readable record name used in API messages
 *  - code      the record-code column, or null
 *  - generate  prefix used when the server generates the code itself
 *  - scheme    the scheme-name column ('scheme_name' when omitted, null for none)
 *  - status    the workflow-status column, its allowed values and default
 *  - parent    the column holding the parent record id and the parent model
 *  - dates     target date-string column => prefix of its eth_month/eth_day/eth_year inputs
 *  - fields    client-writable columns and their validation rules
 *  - transient client inputs used to derive other values but not stored themselves
 *  - server    server-managed columns with their initial value (client values ignored)
 *  - computed  derived columns stored on save, with their type
 *  - presented derived values added when the record is serialised (not stored)
 */
abstract class IrrigationDefinition
{
    /** @var array<class-string, array> */
    private static array $cache = [];

    abstract protected static function config(): array;

    public static function get(): array
    {
        return self::$cache[static::class] ??= static::config();
    }

    public static function label(): string
    {
        return static::get()['label'];
    }

    public static function codeField(): ?string
    {
        return static::get()['code'] ?? null;
    }

    public static function schemeField(): ?string
    {
        $def = static::get();

        return array_key_exists('scheme', $def) ? $def['scheme'] : 'scheme_name';
    }

    public static function statusField(): ?string
    {
        return static::get()['status']['field'] ?? null;
    }

    public static function parentField(): ?string
    {
        return static::get()['parent']['field'] ?? null;
    }

    /** Normalise feature-specific client input before validation. */
    public static function normalize(array $input): array
    {
        return $input;
    }

    /**
     * Every stored column with its value type (int, float, bool, array, string),
     * in the order the API returns them.
     */
    public static function columns(): array
    {
        $def = static::get();
        $names = array_keys(self::commonRules());

        foreach ([static::codeField(), static::schemeField(), static::statusField(), static::parentField()] as $name) {
            if ($name) {
                $names[] = $name;
            }
        }
        foreach ($def['dates'] ?? [] as $target => $prefix) {
            array_push($names, $target, $prefix.'month', $prefix.'day', $prefix.'year');
        }
        foreach (array_keys($def['fields']) as $field) {
            if (! str_contains($field, '.')) {
                $names[] = $field;
            }
        }
        $names = array_merge($names, array_keys($def['server'] ?? []), array_keys($def['computed'] ?? []));

        $columns = [];
        foreach (array_unique($names) as $name) {
            $columns[$name] = static::fieldType($name);
        }

        return $columns;
    }

    /**
     * Value type of a field, derived from its validation rules or declared type.
     * One of: int, float, bool, array, string.
     */
    public static function fieldType(string $field): string
    {
        $def = static::get();

        if (isset($def['computed'][$field])) {
            return $def['computed'][$field];
        }
        if (isset($def['presented'][$field])) {
            return $def['presented'][$field];
        }
        if (isset($def['server_types'][$field])) {
            return $def['server_types'][$field];
        }
        if (preg_match('/^eth_(start_|end_)?day$/', $field) || static::parentField() === $field) {
            return 'int';
        }

        $rules = $def['fields'][$field] ?? $def['transient'][$field] ?? self::commonRules()[$field] ?? null;
        foreach ($rules ?? [] as $rule) {
            $type = match ($rule) {
                'integer' => 'int',
                'numeric' => 'float',
                'boolean' => 'bool',
                'array' => 'array',
                default => null,
            };
            if ($type) {
                return $type;
            }
        }

        return 'string';
    }

    /** Rules shared by every feature. */
    public static function commonRules(): array
    {
        return [
            'fiscal_year' => ['nullable', 'string', 'regex:'.IrrigationEnums::FISCAL_YEAR_PATTERN],
            'zone' => self::str(false),
            'woreda' => self::str(false),
            'kebele' => self::str(false),
            'zone_id' => ['nullable', 'integer', 'min:1'],
            'woreda_id' => ['nullable', 'integer', 'min:1'],
            'kebele_id' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /** eth_month / eth_day / eth_year rules for a date prefix. */
    public static function dateRules(string $prefix, bool $required = true): array
    {
        $presence = $required ? 'required' : 'nullable';

        return [
            $prefix.'month' => [$presence, Rule::in(IrrigationEnums::ETHIOPIAN_MONTHS)],
            $prefix.'day' => [$presence, 'integer', 'min:1', 'max:30'],
            $prefix.'year' => [$presence, 'string', 'regex:'.IrrigationEnums::FISCAL_YEAR_PATTERN],
        ];
    }

    // ── rule helpers for subclasses ─────────────────────────────────────────

    protected static function str(bool $required = true, int $max = 255): array
    {
        return [$required ? 'required' : 'nullable', 'string', 'max:'.$max];
    }

    protected static function text(): array
    {
        return ['nullable', 'string', 'max:5000'];
    }

    protected static function num(bool $required = true, float $min = 0, ?float $max = null): array
    {
        return array_values(array_filter([
            $required ? 'required' : 'nullable', 'numeric', 'min:'.$min, $max !== null ? 'max:'.$max : null,
        ]));
    }

    protected static function int(bool $required = true, int $min = 0, ?int $max = null): array
    {
        return array_values(array_filter([
            $required ? 'required' : 'nullable', 'integer', 'min:'.$min, $max !== null ? 'max:'.$max : null,
        ], fn ($v) => $v !== null));
    }

    protected static function in(array $values, bool $required = true): array
    {
        return [$required ? 'required' : 'nullable', 'string', Rule::in($values)];
    }

    protected static function bool(bool $required = false): array
    {
        return [$required ? 'required' : 'nullable', 'boolean'];
    }

    protected static function fiscalYear(bool $required = true): array
    {
        return [$required ? 'required' : 'nullable', 'string', 'regex:'.IrrigationEnums::FISCAL_YEAR_PATTERN];
    }

    protected static function checks(array $names): array
    {
        return array_fill_keys($names, self::bool());
    }
}
