<?php

namespace Modules\Irrigation\Tests\Unit;

use Carbon\Carbon;
use Modules\Irrigation\Services\WaterUtilization\WaterSourceService;
use Modules\Irrigation\Support\Construction\FundingAllocationDefinition;
use Modules\Irrigation\Support\EthiopianCalendar;
use Modules\Irrigation\Support\StudyDesign\ReviewVerdict;
use PHPUnit\Framework\TestCase;

class EthiopianCalendarTest extends TestCase
{
    public function test_gregorian_to_ethiopian_conversion(): void
    {
        $this->assertSame(['year' => 2019, 'month' => 1, 'day' => 1], EthiopianCalendar::fromGregorian(Carbon::parse('2026-09-11')));
        $this->assertSame(['year' => 2019, 'month' => 2, 'day' => 5], EthiopianCalendar::fromGregorian(Carbon::parse('2026-10-15')));
        $this->assertSame(['year' => 2019, 'month' => 11, 'day' => 1], EthiopianCalendar::fromGregorian(Carbon::parse('2027-07-08')));
        $this->assertSame(['year' => 2015, 'month' => 13, 'day' => 6], EthiopianCalendar::fromGregorian(Carbon::parse('2023-09-11')));
    }

    public function test_fiscal_year_starts_on_hamle_first(): void
    {
        Carbon::setTestNow('2027-07-07');
        $this->assertSame('2019 E.C.', EthiopianCalendar::currentFiscalYear());
        Carbon::setTestNow('2027-07-08');
        $this->assertSame('2020 E.C.', EthiopianCalendar::currentFiscalYear());
        Carbon::setTestNow();
    }

    public function test_adding_months_skips_pagume(): void
    {
        $this->assertSame('Tikimt 20, 2020 E.C.', EthiopianCalendar::addMonths('Tikimt', 20, '2019 E.C.', 12));
        $this->assertSame('Tikimt 5, 2020 E.C.', EthiopianCalendar::addMonths('Hamle', 5, '2019 E.C.', 3));
        $this->assertSame('Hidar 1, 2020 E.C.', EthiopianCalendar::addMonths('Pagume', 3, '2019 E.C.', 2));
    }

    public function test_parse_round_trips_format(): void
    {
        $label = EthiopianCalendar::format('Tikimt', 20, '2019 E.C.');
        $this->assertSame('Tikimt 20, 2019 E.C.', $label);
        $this->assertSame(['month' => 'Tikimt', 'day' => 20, 'year' => '2019 E.C.'], EthiopianCalendar::parse($label));
        $this->assertNull(EthiopianCalendar::parse('Pending'));
    }

    public function test_domain_rules(): void
    {
        $this->assertSame('Pumping & Lift Technologies', WaterSourceService::sourceCategory('Solar-Powered Pump (የፀሐይ ፓምፕ)'));
        $this->assertSame('Surface Water & Gravity Diversion', WaterSourceService::sourceCategory('Modern River Diversion Weir (ዘመናዊ የወንዝ ጠለፋ)'));
        $this->assertTrue(ReviewVerdict::isApproved('Approved with Minor Comments'));
        $this->assertFalse(ReviewVerdict::isApproved('Major Revisions Required'));
        $this->assertSame('GCF (Climate Fund)', FundingAllocationDefinition::financingProgram('Green Climate Fund (GCF) (በGCF በጀት)'));
        $this->assertSame('Lease / Direct Support', FundingAllocationDefinition::financingProgram('Lease / Direct Support Financing (በኪራይ/ግልጽ ድጋፍ)'));
        $this->assertSame('PACT Program', FundingAllocationDefinition::financingProgram('PACT Program (በPACT በጀት)'));
    }
}
