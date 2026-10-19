<?php

namespace Modules\Irrigation\Services\WaterUtilization;

use Modules\Irrigation\Models\IrrigationRecord;
use Modules\Irrigation\Models\WaterUtilization\WaterSource;
use Modules\Irrigation\Services\IrrigationRecordService;

/**
 * Business rules of water sources & irrigation technologies.
 */
class WaterSourceService extends IrrigationRecordService
{
    public function modelClass(): string
    {
        return WaterSource::class;
    }

    /** @param  WaterSource  $record */
    protected function compute(IrrigationRecord $record, array $input, bool $creating): void
    {
        $record->source_category = self::sourceCategory((string) $record->technology_type);
        $record->total_farmers = $this->total($record, 'farmers_male', 'farmers_female');
    }

    /** Same precedence as the Water Sources page: pump → well → pond → surface. */
    public static function sourceCategory(string $technology): string
    {
        return match (true) {
            str_contains($technology, 'Pump') || str_contains($technology, 'ፓምፕ') => 'Pumping & Lift Technologies',
            str_contains($technology, 'Well') || str_contains($technology, 'ጉድጓድ') => 'Groundwater Wells',
            str_contains($technology, 'Pond') || str_contains($technology, 'ኩሬ') || str_contains($technology, 'ሻሸ') => 'Storage Ponds & Linings',
            default => 'Surface Water & Gravity Diversion',
        };
    }
}
