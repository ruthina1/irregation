/**
 * Shared constants and helpers for Construction Progress & Performance module.
 * Extracted to avoid circular dependencies with component files.
 */

export const SCHEME_TYPES = [
  { value: 'Existing Rehabilitation', label: 'Existing Scheme Rehabilitation (የነባር መስኖ ግንባታ)' },
  { value: 'New Construction', label: 'New Scheme Construction (የአዲስ መስኖ ግንባታ)' },
];

export const PROGRESS_HEALTH_STATUSES = [
  { value: 'On Track', label: 'On Schedule (Normal Variance)', color: 'success' },
  { value: 'Minor Delay', label: 'Minor Delay (Lag < 10%)', color: 'default' },
  { value: 'Critical Delay', label: 'Critical Delay (Lag > 20%)', color: 'error' },
  { value: 'Ahead of Schedule', label: 'Ahead of Schedule', color: 'default' },
  { value: 'Substantially Completed', label: 'Substantially Completed', color: 'default' },
];

export const HEALTHY_STATUSES = ['On Track', 'Ahead of Schedule'];

/** Starting values of a new inspection log (before a contract is chosen). */
export const NEW_LOG_DEFAULTS = {
  planned_progress_pct: 50,
  physical_progress_pct: 45,
  financial_progress_pct: 45,
  weir_concreting_pct: 50,
  canal_excavation_pct: 40,
  canal_lining_km: 0,
  target_canal_lining_km: 10,
  gates_installed_count: 0,
  target_gates_count: 6,
};

export const PROJECTS_PATH = '/irrigation/construction/projects';

export const NOT_TRACKED = 'Not tracked';

/** Value or "Not tracked" when the server has no figure. */
export const orNotTracked = (value, suffix = '') => (
  value === null || value === undefined || value === '' ? NOT_TRACKED : `${value}${suffix}`
);
