<?php

namespace Modules\Irrigation\Services\Construction;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Modules\Irrigation\Models\Construction\ConstructionContract;
use Modules\Irrigation\Models\Institutions\WaterUsersAssociation;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Support\Construction\ConstructionContractEnums;
use Modules\Irrigation\Support\Construction\ConstructionWbs;
use Modules\Irrigation\Support\EthiopianCalendar;

/**
 * Business rules of construction contracts: progress evaluation (kept as a
 * progress-log entry) and the WUA registered for each scheme.
 */
class ConstructionContractService extends IrrigationRecordService
{
    public function modelClass(): string
    {
        return ConstructionContract::class;
    }

    protected function blockingRelations(): array
    {
        return ['progressLogs' => 'Construction progress log'];
    }

    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $record->total_beneficiaries = $this->total($record, 'beneficiaries_male', 'beneficiaries_female');
    }

    /** Contracts expose the name of the WUA registered for their scheme. */
    protected function presentationExtras(Collection $records): array
    {
        $wuas = WaterUsersAssociation::query()->get();
        $byContract = $wuas->filter(fn ($w) => filled($w->contract_code))->keyBy('contract_code');
        $byScheme = $wuas->keyBy(fn ($w) => mb_strtolower((string) $w->scheme_name));

        $extras = [];
        foreach ($records as $contract) {
            $wua = $byContract->get($contract->contract_code) ?? $byScheme->get(mb_strtolower((string) $contract->scheme_name));
            $extras[$contract->id] = ['wua_name' => $wua?->wua_name];
        }

        return $extras;
    }

    public function findByCode(?string $contractCode): ?ConstructionContract
    {
        return $contractCode ? ConstructionContract::query()->where('contract_code', $contractCode)->first() : null;
    }

    /**
     * Evaluate a contract's progress (physical, financial and work-breakdown
     * quantities). The evaluation is also kept as a progress-log entry.
     *
     * @param  array<string, mixed>  $input
     */
    public function evaluateProgress(ConstructionContract $contract, array $input, ?User $user): IrrigationRecord
    {
        return $this->runAction('progress', $contract, $user, function (ConstructionContract $contract) use ($input, $user) {
            $reportDate = (! empty($input['eth_month']) && ! empty($input['eth_day']) && ! empty($input['eth_year']))
                ? EthiopianCalendar::format($input['eth_month'], $input['eth_day'], $input['eth_year'])
                : ($input['reporting_ethiopian_date'] ?? EthiopianCalendar::todayLabel());
            $dateParts = EthiopianCalendar::parse($reportDate);

            $logs = app(ConstructionProgressLogService::class);
            $log = $logs->create([
                'contract_id' => $contract->id,
                'progress_log_code' => $logs->generateCode('PRG', $contract->fiscal_year),
                'site_engineering_remarks' => $input['site_progress_notes'] ?? null,
                'eth_month' => $dateParts['month'] ?? null,
                'eth_day' => $dateParts['day'] ?? null,
                'eth_year' => $dateParts['year'] ?? null,
            ] + array_intersect_key($input, array_flip(ConstructionWbs::PROGRESS_FIELDS)), $user);
            $log->health_status = $input['health_status'];
            $log->save();

            $contract->refresh();
            foreach ([...ConstructionWbs::PROGRESS_FIELDS, 'health_status'] as $field) {
                $contract->setAttribute($field, $input[$field]);
            }
            $contract->reporting_ethiopian_date = $reportDate;
            if (filled($input['site_progress_notes'] ?? null)) {
                $contract->site_progress_notes = $input['site_progress_notes'];
            }
            if ((float) $input['physical_progress_pct'] >= 100) {
                $contract->construction_status = ConstructionContractEnums::HANDED_OVER;
            }
            $contract->save();
        });
    }

    /** Add a disbursement to the contract's financial progress. */
    public function recordDisbursement(ConstructionContract $contract, float $amount): void
    {
        $disbursed = $this->number($contract, 'disbursed_sum_etb') + $amount;
        $contractSum = $this->number($contract, 'contract_sum_etb');

        $contract->disbursed_sum_etb = $disbursed;
        $contract->financial_progress_pct = $contractSum > 0 ? min(100, round($disbursed / $contractSum * 100, 1)) : 0;
        $contract->save();
    }

    public function markHandedOver(?ConstructionContract $contract): void
    {
        if ($contract && $contract->construction_status !== ConstructionContractEnums::HANDED_OVER) {
            $contract->construction_status = ConstructionContractEnums::HANDED_OVER;
            $contract->save();
        }
    }
}
