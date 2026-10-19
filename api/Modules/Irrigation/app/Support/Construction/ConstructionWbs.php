<?php

namespace Modules\Irrigation\Support\Construction;

/**
 * Work-breakdown progress fields shared by a contract's progress evaluation
 * and its progress-log entries.
 */
final class ConstructionWbs
{
    /** Columns copied from the newest progress log onto its contract. */
    public const PROGRESS_FIELDS = [
        'planned_progress_pct', 'physical_progress_pct', 'financial_progress_pct', 'weir_concreting_pct',
        'canal_excavation_pct', 'canal_lining_km', 'target_canal_lining_km', 'gates_installed_count',
        'target_gates_count', 'resident_engineer',
    ];

    /** @return array<string, list<string>> */
    public static function rules(): array
    {
        return [
            'planned_progress_pct' => ['required', 'numeric', 'min:0', 'max:100'],
            'physical_progress_pct' => ['required', 'numeric', 'min:0', 'max:100'],
            'financial_progress_pct' => ['required', 'numeric', 'min:0', 'max:100'],
            'weir_concreting_pct' => ['required', 'numeric', 'min:0', 'max:100'],
            'canal_excavation_pct' => ['required', 'numeric', 'min:0', 'max:100'],
            'canal_lining_km' => ['required', 'numeric', 'min:0'],
            'target_canal_lining_km' => ['required', 'numeric', 'min:0'],
            'gates_installed_count' => ['required', 'integer', 'min:0'],
            'target_gates_count' => ['required', 'integer', 'min:0'],
            'resident_engineer' => ['required', 'string', 'max:255'],
        ];
    }
}
