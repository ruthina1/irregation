<?php

namespace Modules\Irrigation\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Irrigation\Support\IrrigationDefinition;

/**
 * Base model for the records of one Irrigation feature. Each feature has its
 * own table whose columns are described by its IrrigationDefinition.
 *
 * @property int $id
 * @property string|null $fiscal_year
 * @property string|null $zone
 * @property string|null $woreda
 * @property string|null $kebele
 */
abstract class IrrigationRecord extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    /** @return class-string<IrrigationDefinition> */
    abstract public static function definitionClass(): string;

    /** @return class-string<IrrigationDefinition> */
    public function definition(): string
    {
        return static::definitionClass();
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        $casts = [];
        foreach (static::definitionClass()::columns() as $column => $type) {
            $cast = match ($type) {
                'int' => 'integer',
                'float' => 'decimal:2',
                'bool' => 'boolean',
                'array' => 'array',
                default => null,
            };
            if ($cast) {
                $casts[$column] = $cast;
            }
        }

        return array_merge(parent::casts(), $casts, $this->casts ?? []);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function field(string $name, mixed $default = null): mixed
    {
        return $this->getAttribute($name) ?? $default;
    }

    public function code(): ?string
    {
        $field = static::definitionClass()::codeField();

        return $field ? $this->getAttribute($field) : null;
    }

    public function status(): ?string
    {
        $field = static::definitionClass()::statusField();

        return $field ? $this->getAttribute($field) : null;
    }

    public function setStatus(?string $status): void
    {
        $this->setAttribute(static::definitionClass()::statusField(), $status);
    }

    public function schemeName(): ?string
    {
        $field = static::definitionClass()::schemeField();

        return $field ? $this->getAttribute($field) : null;
    }

    /**
     * Serialise the record in the shape the frontend pages consume: every
     * column at the top level, plus `id` and timestamps.
     *
     * @param  array<string, mixed>  $extra  values derived from related records
     * @return array<string, mixed>
     */
    public function toApiArray(array $extra = []): array
    {
        $definition = static::definitionClass();
        $out = [];

        foreach (array_keys($definition::columns()) as $column) {
            $out[$column] = $this->getAttribute($column);
        }
        $out = array_merge($out, $extra);

        foreach ($out as $key => $value) {
            $out[$key] = self::castValue($definition::fieldType($key), $value);
        }

        $out['id'] = $this->id;
        $out['created_at'] = $this->created_at?->toIso8601String();
        $out['updated_at'] = $this->updated_at?->toIso8601String();

        return $out;
    }

    public static function castValue(string $type, mixed $value): mixed
    {
        if ($value === null || $value === '') {
            return $type === 'string' ? $value : null;
        }

        return match ($type) {
            'int' => (int) round((float) $value),
            'float' => round((float) $value, 4),
            'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'array' => is_array($value) ? $value : (array) $value,
            default => is_scalar($value) ? (string) $value : $value,
        };
    }
}
