import { exportRowsToCsv } from '../../shared/utils';

export const sum = (rows, field) => rows.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);

/** part/whole as a percentage string with `digits` decimals; '0.0' style when whole is 0. */
export const pct = (part, whole, digits = 1) => (whole > 0 ? ((part / whole) * 100).toFixed(digits) : (0).toFixed(digits));

export const millions = (value, digits = 1) => ((Number(value) || 0) / 1000000).toFixed(digits);

export const fmt = (value) => (Number(value) || 0).toLocaleString();

export const NOT_TRACKED = 'Not tracked';

/** Export with a warning when there is nothing to export. */
export const exportReport = (message, rows, columns, filePrefix, successText) => {
  if (!rows.length) {
    message.warning('No report rows available to export for this fiscal year');
    return;
  }
  exportRowsToCsv(rows, columns, filePrefix);
  message.success(successText);
};

export const EMPTY_TEXT = 'No records for this fiscal year yet';
