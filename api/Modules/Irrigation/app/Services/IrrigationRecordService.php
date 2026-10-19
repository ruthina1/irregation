<?php

namespace Modules\Irrigation\Services;

use App\Models\User;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\EthiopianCalendar;
use Modules\Irrigation\Support\IrrigationDefinition;
use Modules\Irrigation\Support\IrrigationEnums;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

/**
 * Listing, persistence and derived fields shared by every Irrigation feature.
 * Each feature service extends this class and overrides the hooks it needs
 * (compute, afterCreate, afterSave, beforeUpdate, presentationExtras, ...).
 */
abstract class IrrigationRecordService
{
    /** Logical sort keys a client may use. */
    private const SORTABLE = ['created_at', 'updated_at', 'code', 'scheme_name', 'status', 'fiscal_year', 'zone', 'woreda'];

    /** Upper bound for unpaginated listings. */
    private const MAX_UNPAGINATED = 5000;

    /** @return class-string<IrrigationRecord> */
    abstract public function modelClass(): string;

    /** @return class-string<IrrigationDefinition> */
    public function definition(): string
    {
        return $this->modelClass()::definitionClass();
    }

    public function query(): Builder
    {
        return $this->modelClass()::query();
    }

    // ── queries ─────────────────────────────────────────────────────────────

    /**
     * List records with the supported filters: fiscal_year, status, zone,
     * woreda, code, parent_id (or the parent column, e.g. project_id),
     * search/q, sort, direction, per_page.
     *
     * Without per_page the whole (filtered) list is returned, which is what
     * the pages expect; with per_page a paginator is returned.
     *
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): Collection|LengthAwarePaginator
    {
        $definition = $this->definition();
        $query = $this->query();

        if (filled($filters['fiscal_year'] ?? null)) {
            $query->where('fiscal_year', $filters['fiscal_year']);
        }

        $columns = [
            'status' => $definition::statusField(),
            'code' => $definition::codeField(),
            'zone' => 'zone',
            'woreda' => 'woreda',
        ];
        foreach ($columns as $filter => $column) {
            if ($column && filled($filters[$filter] ?? null)) {
                $query->where($column, $filters[$filter]);
            }
        }

        $parentField = $definition::parentField();
        $parentId = $filters['parent_id'] ?? ($parentField ? ($filters[$parentField] ?? null) : null);
        if ($parentField && filled($parentId)) {
            $query->where($parentField, (int) $parentId);
        }

        $search = trim((string) ($filters['search'] ?? $filters['q'] ?? ''));
        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $search).'%';
            $searchable = array_filter([$definition::codeField(), $definition::schemeField(), 'zone', 'woreda', 'kebele']);
            $query->where(function (Builder $q) use ($like, $searchable) {
                foreach ($searchable as $column) {
                    $q->orWhere($column, 'like', $like);
                }
            });
        }

        $sortColumn = $this->sortColumn($filters['sort'] ?? null);
        $direction = strtolower((string) ($filters['direction'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortColumn, $direction)->orderBy('id', $direction);

        if (filled($filters['per_page'] ?? null)) {
            return $query->paginate(max(1, min(200, (int) $filters['per_page'])))->withQueryString();
        }

        return $query->limit(self::MAX_UNPAGINATED)->get();
    }

    private function sortColumn(?string $sort): string
    {
        $definition = $this->definition();
        $column = match (in_array($sort, self::SORTABLE, true) ? $sort : null) {
            'code' => $definition::codeField(),
            'scheme_name' => $definition::schemeField(),
            'status' => $definition::statusField(),
            null => null,
            default => $sort,
        };

        return $column ?? 'created_at';
    }

    public function find(int|string $id): IrrigationRecord
    {
        return $this->query()->findOrFail($id);
    }

    // ── presentation ────────────────────────────────────────────────────────

    /** @return array<string, mixed> */
    public function present(IrrigationRecord $record): array
    {
        return $this->presentMany(new Collection([$record]))[0];
    }

    /** @return list<array<string, mixed>> */
    public function presentMany(iterable $records): array
    {
        $records = $records instanceof Collection ? $records : new Collection($records);
        if ($records->isEmpty()) {
            return [];
        }

        $extras = $this->presentationExtras($records);

        return $records->map(fn (IrrigationRecord $r) => $r->toApiArray($extras[$r->id] ?? []))->values()->all();
    }

    /**
     * Values derived from related records, keyed by record id.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function presentationExtras(Collection $records): array
    {
        return [];
    }

    // ── writes ──────────────────────────────────────────────────────────────

    /** @param  array<string, mixed>  $input */
    public function create(array $input, ?User $user): IrrigationRecord
    {
        return DB::transaction(function () use ($input, $user) {
            $class = $this->modelClass();
            $record = new $class;
            $record->created_by = $user?->id;
            $record->updated_by = $user?->id;

            $this->fill($record, $input, creating: true);
            $this->afterCreate($record);
            $this->afterSave($record, null);

            Log::info('irrigation.record.created', ['model' => $class, 'id' => $record->id, 'user_id' => $user?->id]);

            return $record->refresh();
        });
    }

    /** @param  array<string, mixed>  $input */
    public function update(IrrigationRecord $record, array $input, ?User $user): IrrigationRecord
    {
        return DB::transaction(function () use ($record, $input, $user) {
            $previousStatus = $record->status();
            $record->updated_by = $user?->id;

            $this->beforeUpdate($record, $input);
            $this->fill($record, $input, creating: false);
            $this->afterSave($record, $previousStatus);

            Log::info('irrigation.record.updated', ['model' => $record::class, 'id' => $record->id, 'user_id' => $user?->id]);

            return $record->refresh();
        });
    }

    public function delete(IrrigationRecord $record, ?User $user): void
    {
        DB::transaction(function () use ($record, $user) {
            $blocking = [];
            foreach ($this->blockingRelations() as $relation => $label) {
                $count = $record->{$relation}()->count();
                if ($count > 0) {
                    $blocking[] = "{$count} {$label}(s)";
                }
            }
            if ($blocking) {
                throw new ConflictHttpException('This record cannot be deleted because it is referenced by '.implode(', ', $blocking).'. Remove or re-link those records first.');
            }

            foreach ($this->ownedRelations() as $relation) {
                $record->{$relation}()->get()->each->delete();
            }
            $record->delete();

            Log::info('irrigation.record.deleted', ['model' => $record::class, 'id' => $record->id, 'user_id' => $user?->id]);
        });
    }

    /**
     * Run a workflow action on a locked, fresh copy of the record.
     *
     * @param  Closure(IrrigationRecord): void  $action
     */
    protected function runAction(string $name, IrrigationRecord $record, ?User $user, Closure $action): IrrigationRecord
    {
        $result = DB::transaction(function () use ($record, $user, $action) {
            $locked = $this->query()->lockForUpdate()->findOrFail($record->id);
            $locked->updated_by = $user?->id;
            $action($locked);

            return $locked->refresh();
        });

        Log::info('irrigation.workflow.'.$name, ['model' => $result::class, 'id' => $result->id, 'user_id' => $user?->id]);

        return $result;
    }

    /**
     * Copy validated input onto the record, apply defaults and derived fields
     * and persist it.
     *
     * @param  array<string, mixed>  $input
     */
    public function fill(IrrigationRecord $record, array $input, bool $creating): void
    {
        $definition = $this->definition();
        $config = $definition::get();
        $server = $config['server'] ?? [];

        $writable = array_keys(array_merge(IrrigationDefinition::commonRules(), $config['fields']));
        foreach ($writable as $field) {
            if (str_contains($field, '.') || array_key_exists($field, $server)) {
                continue;
            }
            if (array_key_exists($field, $input)) {
                $record->setAttribute($field, $input[$field]);
            }
        }

        $status = $config['status'] ?? null;
        if ($status && empty($status['server']) && filled($input[$status['field']] ?? null)) {
            $record->setStatus($input[$status['field']]);
        }
        if ($creating && $status && blank($record->status())) {
            $record->setStatus($status['default']);
        }

        $parent = $config['parent'] ?? null;
        if ($parent && array_key_exists($parent['field'], $input) && ($creating || empty($parent['locked']))) {
            $record->setAttribute($parent['field'], $input[$parent['field']] ?: null);
        }

        foreach ($config['dates'] ?? [] as $target => $prefix) {
            $month = $input[$prefix.'month'] ?? null;
            $day = $input[$prefix.'day'] ?? null;
            $year = $input[$prefix.'year'] ?? null;
            if ($month && $day && $year) {
                $record->setAttribute($target, EthiopianCalendar::format($month, (int) $day, $year));
                $record->setAttribute($prefix.'month', $month);
                $record->setAttribute($prefix.'day', (int) $day);
                $record->setAttribute($prefix.'year', $year);
            }
        }

        if ($creating) {
            foreach ($server as $field => $default) {
                $record->setAttribute($field, $default);
            }
            if ($prefix = $config['generate'] ?? null) {
                $record->setAttribute($definition::codeField(), $this->generateCode($prefix, $record->fiscal_year));
            }
        }

        $this->deriveFiscalYear($record, $input);
        $this->compute($record, $input, $creating);

        $record->save();
    }

    /** @param  array<string, mixed>  $input */
    private function deriveFiscalYear(IrrigationRecord $record, array $input): void
    {
        $config = $this->definition()::get();
        $parent = $config['parent'] ?? null;

        if (! empty($parent['fiscal_year']) && $record->getAttribute($parent['field'])) {
            $record->fiscal_year = $parent['model']::query()->whereKey($record->getAttribute($parent['field']))->value('fiscal_year')
                ?? $record->fiscal_year;
        }
        if (filled($record->fiscal_year)) {
            return;
        }

        foreach ($config['dates'] ?? [] as $prefix) {
            if (! empty($input[$prefix.'year']) && ! empty($input[$prefix.'month'])) {
                $year = EthiopianCalendar::yearNumber($input[$prefix.'year']);
                $monthIndex = array_search($input[$prefix.'month'], IrrigationEnums::ETHIOPIAN_MONTHS, true);
                // Government fiscal year starts on Hamle 1 (month 11).
                $record->fiscal_year = ($monthIndex !== false && $monthIndex >= 10 ? $year + 1 : $year).' E.C.';

                return;
            }
        }

        $record->fiscal_year = EthiopianCalendar::currentFiscalYear();
    }

    /** Next sequential code such as SHLF-2019-004 for this feature. */
    public function generateCode(string $prefix, ?string $fiscalYear): string
    {
        $codeField = $this->definition()::codeField();
        $year = EthiopianCalendar::yearNumber($fiscalYear ?: EthiopianCalendar::currentFiscalYear());
        $base = "{$prefix}-{$year}-";
        $existing = $this->modelClass()::withTrashed()->where($codeField, 'like', $base.'%')->pluck($codeField);

        $next = $existing->map(fn ($code) => (int) substr($code, strlen($base)))->max() + 1;

        return $base.str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }

    // ── hooks ───────────────────────────────────────────────────────────────

    /**
     * Set derived columns before the record is saved.
     *
     * @param  array<string, mixed>  $input
     */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void {}

    /** Runs once after a new record is saved. */
    protected function afterCreate(IrrigationRecord $record): void {}

    /** Runs after every create and update; keeps related records in step. */
    protected function afterSave(IrrigationRecord $record, ?string $previousStatus): void {}

    /** @param  array<string, mixed>  $input */
    protected function beforeUpdate(IrrigationRecord $record, array $input): void {}

    /**
     * Relations that prevent deletion while they have records (relation => label).
     *
     * @return array<string, string>
     */
    protected function blockingRelations(): array
    {
        return [];
    }

    /**
     * Relations whose records are deleted together with this record.
     *
     * @return list<string>
     */
    protected function ownedRelations(): array
    {
        return [];
    }

    // ── helpers for feature services ────────────────────────────────────────

    /** Sum of integer columns (e.g. male + female). */
    protected function total(IrrigationRecord $record, string ...$columns): int
    {
        return array_sum(array_map(fn (string $c) => (int) ($record->getAttribute($c) ?? 0), $columns));
    }

    protected function number(IrrigationRecord $record, string $column): float
    {
        return (float) ($record->getAttribute($column) ?? 0);
    }

    /**
     * Build a checklist object from check_* inputs. Keys that were not
     * submitted keep their previous value (or false for a new record).
     *
     * @param  array<string, mixed>  $input
     * @param  array<string, string>  $map  checklist key => check_* input
     */
    protected function checklist(IrrigationRecord $record, array $input, string $target, array $map): void
    {
        $current = (array) ($record->getAttribute($target) ?? []);
        $submitted = isset($input[$target]) && is_array($input[$target]) ? $input[$target] : [];

        foreach ($map as $key => $checkField) {
            if (array_key_exists($checkField, $input) && $input[$checkField] !== null) {
                $current[$key] = (bool) $input[$checkField];
            } elseif (array_key_exists($key, $submitted)) {
                $current[$key] = (bool) $submitted[$key];
            } else {
                $current[$key] = (bool) ($current[$key] ?? false);
            }
        }

        $record->setAttribute($target, $current);
    }

    /** Copy the location columns of a related record. */
    protected function copyLocation(IrrigationRecord $target, IrrigationRecord $source): void
    {
        $target->zone = $source->zone;
        $target->woreda = $source->woreda;
        $target->kebele = $source->kebele;
    }
}
