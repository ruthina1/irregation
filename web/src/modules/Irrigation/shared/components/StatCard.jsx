import '../irrigation.css';

const formatValue = (value, precision) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return value ?? '—';
  return value.toLocaleString(undefined, precision === undefined ? undefined : {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};

/**
 * KPI card used across the Irrigation pages: title and value on the left,
 * the icon (passed as `prefix`) in a soft tile on the right, footnote below.
 * `color` is accepted for compatibility but no longer tints the card.
 */
// eslint-disable-next-line no-unused-vars
export default function StatCard({ title, value, prefix, suffix, precision, color, footnote, onClick, children }) {
  return (
    <div
      className={`irr-stat${onClick ? ' is-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
    >
      <div className="irr-stat-top">
        <div style={{ minWidth: 0 }}>
          <div className="irr-stat-title">{title}</div>
          <div className="irr-stat-value">
            {formatValue(value, precision)}
            {suffix && <span className="irr-stat-suffix">{suffix}</span>}
          </div>
        </div>
        {prefix && <div className="irr-stat-icon">{prefix}</div>}
      </div>
      {children && <div className="irr-stat-extra" style={{ marginTop: 8 }}>{children}</div>}
      {footnote && <div className="irr-stat-foot">{footnote}</div>}
    </div>
  );
}
