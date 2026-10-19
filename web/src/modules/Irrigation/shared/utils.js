import { exportToCSV } from '../../../utils/exportUtils';
import { TODAY_ETH } from './constants';

/** Location and lookup values may be a plain string or an object with a name. */
export const extractName = (value, defaultVal = 'Unspecified') => {
  if (!value) return defaultVal;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.name || value.title || value.kebele_name || value.woreda_name || value.zone_name || defaultVal;
  }
  return String(value);
};

export const toNumber = (value) => Number(value) || 0;

export const sumBy = (rows, field) => rows.reduce((acc, row) => acc + toNumber(row[field]), 0);

export const percent = (part, whole, digits = 0) => (whole > 0 ? Number(((part / whole) * 100).toFixed(digits)) : 0);

/** "Tikimt 20, 2019 E.C." */
export const formatEthDate = (month, day, year) => `${month} ${day}, ${year}`;

/**
 * Split a stored "Tikimt 20, 2019 E.C." string back into form fields, so an
 * edit form shows the saved date. `prefix` supports eth_start_ / eth_end_.
 */
export const ethDateFields = (label, fallback = TODAY_ETH, prefix = 'eth_') => {
  const match = typeof label === 'string' ? label.trim().match(/^(\p{L}+)\s+(\d{1,2}),\s*(\d{4} E\.C\.)$/u) : null;
  const parts = match
    ? { month: match[1], day: Number(match[2]), year: match[3] }
    : { month: fallback.eth_month, day: fallback.eth_day, year: fallback.eth_year };

  return { [`${prefix}month`]: parts.month, [`${prefix}day`]: parts.day, [`${prefix}year`]: parts.year };
};

/** Human-readable message for a failed API call (422 → first field error). */
export const getApiErrorMessage = (error, fallback = 'The request could not be completed.') => {
  if (!error?.response) {
    return 'Unable to reach the Irrigation service. Check your connection and try again.';
  }
  const { data, status } = error.response;
  if (status === 422 && data?.errors) {
    const first = Object.values(data.errors)[0];
    return (Array.isArray(first) ? first[0] : first) || data.message || fallback;
  }
  if (status === 403) return data?.message || 'You do not have permission to perform this action.';
  return data?.message || fallback;
};

/** Attach 422 validation errors to the matching antd form fields. */
export const applyFormErrors = (form, error) => {
  const errors = error?.response?.status === 422 ? error.response.data?.errors : null;
  if (!form || !errors) return;

  form.setFields(
    Object.entries(errors).map(([name, messages]) => ({
      name: name.includes('.') ? name.split('.').map((p) => (/^\d+$/.test(p) ? Number(p) : p)) : name,
      errors: Array.isArray(messages) ? messages : [String(messages)],
    }))
  );
};

/** Report an API failure to the user (and onto the form, when given). */
export const notifyApiError = (message, error, fallback, form) => {
  applyFormErrors(form, error);
  message.error(getApiErrorMessage(error, fallback));
};

/**
 * CSV export through the shared exportToCSV utility.
 * `columns` is a list of [header, (row) => value] pairs.
 */
export const exportRowsToCsv = (rows, columns, filePrefix) => {
  const data = rows.map((row) =>
    Object.fromEntries(columns.map(([header, getValue]) => {
      const value = getValue(row);
      return [header, value === null || value === undefined ? '' : value];
    }))
  );
  exportToCSV(data, `${filePrefix}_${Date.now()}.csv`);
};
