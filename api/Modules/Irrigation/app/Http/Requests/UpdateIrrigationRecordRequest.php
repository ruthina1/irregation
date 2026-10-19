<?php

namespace Modules\Irrigation\Http\Requests;

/**
 * Base request for changing a record of one Irrigation feature:
 * PUT replaces the client-writable fields, PATCH validates only what is sent.
 */
abstract class UpdateIrrigationRecordRequest extends IrrigationRecordRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return $this->recordRules(
            $this->isMethod('PATCH') ? self::MODE_PATCH : self::MODE_REPLACE,
            (int) $this->route('id'),
        );
    }
}
