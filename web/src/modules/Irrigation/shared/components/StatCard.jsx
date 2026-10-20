import { useNavigate } from 'react-router-dom';
import '../irrigation.css';

const formatValue = (value, precision) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return value ?? '—';
  return value.toLocaleString(undefined, precision === undefined ? undefined : {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};

const resolveColorClass = (color, variant) => {
  const c = String(variant || color || '').toLowerCase().trim();
  if (['green', 'emerald', 'teal', 'mint'].includes(c)) return 'irr-stat-icon--green';
  if (['blue', 'cyan', 'sky'].includes(c)) return 'irr-stat-icon--blue';
  if (['orange', 'amber', 'peach', 'yellow'].includes(c)) return 'irr-stat-icon--orange';
  if (['purple', 'violet', 'indigo', 'lavender'].includes(c)) return 'irr-stat-icon--purple';
  return '';
};

/**
 * KPI card used across the Irrigation pages: title and value on the left,
 * the icon (passed as `prefix`) in a soft tile on the right, footnote below.
 * Clicking redirects to the underlying information/route or scrolls to the fetched records table.
 */
export default function StatCard({ title, value, prefix, suffix, precision, color, variant, footnote, onClick, to, children }) {
  const navigate = useNavigate();
  const colorClass = resolveColorClass(color, variant);

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (to) {
      navigate(to);
      return;
    }
    // Operational fallback: scroll smoothly to the table containing the fetched records
    const table = document.querySelector('.ant-table-wrapper, .irr-table, .ant-table');
    if (table) {
      table.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div
      className="irr-stat is-clickable"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); }}
    >
      <div className="irr-stat-top">
        <div style={{ minWidth: 0 }}>
          <div className="irr-stat-title">{title}</div>
          <div className="irr-stat-value">
            {formatValue(value, precision)}
            {suffix && <span className="irr-stat-suffix">{suffix}</span>}
          </div>
        </div>
        {prefix && (
          <div className={`irr-stat-icon ${colorClass}`.trim()}>
            {prefix}
          </div>
        )}
      </div>
      {children && <div className="irr-stat-extra" style={{ marginTop: 8 }}>{children}</div>}
      {footnote && <div className="irr-stat-foot">{footnote}</div>}
    </div>
  );
}

