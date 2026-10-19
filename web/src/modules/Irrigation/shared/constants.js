/**
 * Values shared by every Irrigation page.
 */

export const ETHIOPIAN_MONTHS = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yakatit',
  'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume',
];

/**
 * Current Ethiopian (E.C.) date for a Gregorian date, via the Julian Day Number.
 * Mirrors api/Modules/Irrigation/app/Support/EthiopianCalendar.php.
 */
export const toEthiopianDate = (date = new Date()) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);

  return {
    year: 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460),
    month: Math.floor(n / 30) + 1,
    day: (n % 30) + 1,
  };
};

/** The government fiscal year starts on Hamle 1 (month 11). */
const today = toEthiopianDate();
const currentFiscalYearNumber = today.month >= 11 ? today.year + 1 : today.year;

export const CURRENT_FISCAL_YEAR = `${currentFiscalYearNumber} E.C.`;

/** Three past fiscal years, the current one and the next one (e.g. 2016 … 2020 E.C.). */
export const ETHIOPIAN_FISCAL_YEARS = [-3, -2, -1, 0, 1].map((offset) => `${currentFiscalYearNumber + offset} E.C.`);

export const TODAY_ETH = {
  eth_month: ETHIOPIAN_MONTHS[today.month - 1],
  eth_day: today.day,
  eth_year: `${today.year} E.C.`,
};

export const BRAND_GREEN = '#1a5f2c';
