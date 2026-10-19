<?php

namespace Modules\Irrigation\Support;

use DateTimeInterface;

/**
 * Minimal Ethiopian (Ge'ez) calendar helper.
 *
 * The Irrigation pages exchange dates as display strings such as
 * "Tikimt 20, 2019 E.C." and fiscal years as "2019 E.C.". The Ethiopian
 * government fiscal year starts on Hamle 1, so Hamle–Pagume belong to the
 * next fiscal year.
 */
final class EthiopianCalendar
{
    private const JDN_EPOCH_OFFSET = 1723856;

    /** @return array{year:int, month:int, day:int} */
    public static function fromGregorian(DateTimeInterface $date): array
    {
        $y = (int) $date->format('Y');
        $m = (int) $date->format('n');
        $d = (int) $date->format('j');

        $a = intdiv(14 - $m, 12);
        $yy = $y + 4800 - $a;
        $mm = $m + 12 * $a - 3;
        $jdn = $d + intdiv(153 * $mm + 2, 5) + 365 * $yy + intdiv($yy, 4) - intdiv($yy, 100) + intdiv($yy, 400) - 32045;

        $r = ($jdn - self::JDN_EPOCH_OFFSET) % 1461;
        $n = ($r % 365) + 365 * intdiv($r, 1460);

        return [
            'year' => 4 * intdiv($jdn - self::JDN_EPOCH_OFFSET, 1461) + intdiv($r, 365) - intdiv($r, 1460),
            'month' => intdiv($n, 30) + 1,
            'day' => ($n % 30) + 1,
        ];
    }

    public static function today(): array
    {
        return self::fromGregorian(now());
    }

    public static function todayLabel(): string
    {
        $t = self::today();

        return self::format(IrrigationEnums::ETHIOPIAN_MONTHS[$t['month'] - 1], $t['day'], $t['year'].' E.C.');
    }

    public static function currentFiscalYear(): string
    {
        $t = self::today();

        return ($t['month'] >= 11 ? $t['year'] + 1 : $t['year']).' E.C.';
    }

    public static function format(string $month, int|string $day, string $yearLabel): string
    {
        return sprintf('%s %d, %s', $month, (int) $day, $yearLabel);
    }

    /** "2019 E.C." → 2019 */
    public static function yearNumber(string $yearLabel): int
    {
        return (int) preg_replace('/\D/', '', $yearLabel);
    }

    /** @return array{month:string, day:int, year:string}|null */
    public static function parse(?string $label): ?array
    {
        if ($label && preg_match('/^(\p{L}+)\s+(\d{1,2}),\s*(\d{4} E\.C\.)$/u', trim($label), $m)) {
            return ['month' => $m[1], 'day' => (int) $m[2], 'year' => $m[3]];
        }

        return null;
    }

    /**
     * Add whole months to an Ethiopian date. Pagume (the 5/6-day 13th month)
     * is skipped, so a date in Pagume rolls into Meskerem of the next year.
     */
    public static function addMonths(string $month, int $day, string $yearLabel, int $months): string
    {
        $index = array_search($month, IrrigationEnums::ETHIOPIAN_MONTHS, true);
        $year = self::yearNumber($yearLabel);

        if ($index === false) {
            $index = 0;
        }
        if ($index === 12) {
            $index = 0;
            $year++;
            $day = 1;
        }

        $target = $index + $months;
        $year += intdiv($target, 12);
        $index = $target % 12;

        return self::format(IrrigationEnums::ETHIOPIAN_MONTHS[$index], min($day, 30), $year.' E.C.');
    }
}
