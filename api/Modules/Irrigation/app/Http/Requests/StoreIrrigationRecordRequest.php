<?php

namespace Modules\Irrigation\Http\Requests;

/**
 * Base request for creating a record of one Irrigation feature.
 */
abstract class StoreIrrigationRecordRequest extends IrrigationRecordRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return $this->recordRules(self::MODE_STORE);
    }
}
