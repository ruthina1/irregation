<?php

namespace Modules\Irrigation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Support\IrrigationDefinition;
use Modules\Irrigation\Support\IrrigationInputNormalizer;

/**
 * Base request for creating or changing a record of one Irrigation feature;
 * the rules come from the feature's IrrigationDefinition.
 */
abstract class IrrigationRecordRequest extends FormRequest
{
    protected const MODE_STORE = 'store';

    protected const MODE_REPLACE = 'replace';

    protected const MODE_PATCH = 'patch';

    /** @return class-string<IrrigationRecord> */
    abstract protected function modelClass(): string;

    /** Access is enforced by the route's auth + permission middleware. */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $definition = $this->modelClass()::definitionClass();

        $this->replace($definition::normalize(IrrigationInputNormalizer::normalize($this->all())));
    }

    /** @return array<string, list<mixed>> */
    protected function recordRules(string $mode, ?int $ignoreId = null): array
    {
        $model = $this->modelClass();
        $definition = $model::definitionClass();
        $config = $definition::get();
        $table = (new $model)->getTable();

        $rules = array_merge(IrrigationDefinition::commonRules(), $config['fields'], $config['transient'] ?? []);

        $status = $config['status'] ?? null;
        if ($status && empty($status['server'])) {
            $presence = ! empty($status['required']) ? 'required' : 'nullable';
            $rules[$status['field']] = [$presence, 'string', Rule::in($status['values'])];
        }

        $parent = $config['parent'] ?? null;
        if ($parent && ($mode === self::MODE_STORE || empty($parent['locked']))) {
            $rules[$parent['field']] = [
                ! empty($parent['required']) ? 'required' : 'nullable',
                'integer',
                Rule::exists((new $parent['model'])->getTable(), 'id')->whereNull('deleted_at'),
            ];
        }

        foreach ($config['dates'] ?? [] as $prefix) {
            $rules = array_merge($rules, IrrigationDefinition::dateRules($prefix));
        }

        $codeField = $definition::codeField();
        if ($codeField && empty($config['generate'])) {
            $rules[$codeField][] = Rule::unique($table, $codeField)->whereNull('deleted_at')->ignore($ignoreId);
        }

        if ($mode === self::MODE_PATCH) {
            $rules = array_map(fn (array $r) => array_merge(['sometimes'], $r), $rules);
        }

        return $rules;
    }
}
