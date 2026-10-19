<?php

namespace Modules\Irrigation\Support;

use Illuminate\Validation\Rule;

/**
 * Query-string filters accepted by every Irrigation list, report and dashboard.
 */
final class IrrigationListFilters
{
    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'fiscal_year' => ['nullable', 'string', 'regex:'.IrrigationEnums::FISCAL_YEAR_PATTERN],
            'status' => ['nullable', 'string', 'max:120'],
            'zone' => ['nullable', 'string', 'max:255'],
            'woreda' => ['nullable', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:64'],
            'parent_id' => ['nullable', 'integer'],
            'project_id' => ['nullable', 'integer'],
            'contract_id' => ['nullable', 'integer'],
            'wua_id' => ['nullable', 'integer'],
            'search' => ['nullable', 'string', 'max:255'],
            'q' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'string', 'max:32'],
            'direction' => ['nullable', Rule::in(['asc', 'desc', 'ASC', 'DESC'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:200'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
