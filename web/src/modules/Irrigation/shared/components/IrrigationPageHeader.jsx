import { Select } from 'antd';

import { ETHIOPIAN_FISCAL_YEARS } from '../constants';
import '../irrigation.css';

/**
 * Toolbar row placed between the KPI cards and the table: the page's filters
 * (children) on the left, then fiscal year, refresh and the page actions on the
 * right, all on one line. Pages still pass `section`, `title` and `subtitle`;
 * they are ignored here because the title is shown in the navbar and breadcrumb.
 */
export default function IrrigationPageHeader({
  fiscalYear,
  onFiscalYearChange,
  onRefresh,
  loading = false,
  extra = null,
  children,
}) {
  return (
    <div className="irr-toolbar">
      {children}
      <div className="irr-toolbar-controls">
        {onFiscalYearChange && (
          <Select
            value={fiscalYear}
            onChange={onFiscalYearChange}
            style={{ width: 120 }}
            aria-label="Fiscal year"
            options={ETHIOPIAN_FISCAL_YEARS.map((fy) => ({ value: fy, label: fy }))}
          />
        )}
      </div>
      {extra && <div className="irr-toolbar-actions">{extra}</div>}
    </div>
  );
}
