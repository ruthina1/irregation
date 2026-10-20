import { exportRowsToCsv } from '../../shared/utils';

export const sum = (rows, field) => (Array.isArray(rows) ? rows : []).reduce((acc, r) => acc + (Number(r[field]) || 0), 0);

/** part/whole as a percentage string with `digits` decimals; '0.0' style when whole is 0. */
export const pct = (part, whole, digits = 1) => (whole > 0 ? ((part / whole) * 100).toFixed(digits) : (0).toFixed(digits));

export const millions = (value, digits = 1) => ((Number(value) || 0) / 1000000).toFixed(digits);

export const fmt = (value) => (Number(value) || 0).toLocaleString();

export const NOT_TRACKED = 'Not tracked';

/** Export with a warning when there is nothing to export. */
export const exportReport = (message, rows, columns, filePrefix, successText) => {
  if (!rows || !rows.length) {
    message.warning('No report rows available to export for this fiscal year');
    return;
  }
  exportRowsToCsv(rows, columns, filePrefix);
  message.success(successText);
};

export const EMPTY_TEXT = 'No records for this fiscal year yet';

/**
 * Muted Enterprise Pastel palette for all chart views:
 * Soft sage green, gentle warm amber, slate blue, dusty rose, and cool slate gray.
 * Balanced, readable, and non-neon.
 */
export const LIGHT_GRAPH_COLORS = {
  green: '#68b684',  // soft sage green
  yellow: '#e8b352', // gentle warm amber / gold (replaces neon yellow)
  blue: '#6fa3d8',   // soft slate blue
  red: '#d97d79',    // dusty rose / muted coral
  gray: '#b0bac5',   // cool slate gray
};

/** Very light colors for table & card progress bars */
export const PROGRESS_BAR_COLORS = {
  green: '#74c69d',   // soft light green
  yellow: '#e8b352',  // soft light warm amber
  blue: '#93c5fd',    // soft light blue
  trail: '#f1f5f9',   // clean light track
};


