<?php

namespace Modules\Irrigation\Services\Construction;

use Modules\Irrigation\Models\Construction\HandoverCertificate;
use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Services\IrrigationRecordService;
use Modules\Irrigation\Support\EthiopianCalendar;

/**
 * Business rules of project completion & handover certificates: handover
 * protocol checklist, defect-liability expiry and the contract's status.
 */
class HandoverCertificateService extends IrrigationRecordService
{
    public function __construct(private readonly ConstructionContractService $contracts) {}

    public function modelClass(): string
    {
        return HandoverCertificate::class;
    }

    /** @param  HandoverCertificate  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $record->total_beneficiaries = $this->total($record, 'beneficiaries_male', 'beneficiaries_female');
        $this->checklist($record, $input, 'protocol_checklist', [
            'hydraulic_wet_run_tested' => 'check_wet_run', 'as_built_drawings_submitted' => 'check_as_built',
            'om_manual_delivered' => 'check_om_manual', 'wua_executive_trained' => 'check_wua_trained',
            'snags_cleared' => 'check_snags_cleared', 'retention_released' => 'check_retention_released',
        ]);

        $date = EthiopianCalendar::parse($record->provisional_handover_eth_date);
        $record->dlp_expiry_eth_date = $date
            ? EthiopianCalendar::addMonths($date['month'], $date['day'], $date['year'], (int) ($record->defect_liability_months ?? 12))
            : null;
    }

    /** @param  HandoverCertificate  $record */
    protected function afterSave(IrrigationRecord $record, ?string $previousStatus): void
    {
        $this->contracts->markHandedOver($this->contracts->findByCode($record->contract_code));
    }
}
