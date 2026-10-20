import { useState, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import '../irrigation.css';

/**
 * Wraps status / KPI cards on Irrigation pages.
 * Portals the refresh button into the breadcrumb row (.irr-breadcrumb-extra)
 * so it is horizontally aligned on the same row/height as the breadcrumb.
 * Falls back to an inline refresh bar if no breadcrumb extra container exists.
 */
export default function IrrigationStatsSection({ onRefresh, loading = false, children, style }) {
  const sectionRef = useRef(null);
  const [portalTarget, setPortalTarget] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    const pageEl = sectionRef.current.closest('.irr-page') || sectionRef.current.parentElement;
    const target = pageEl ? pageEl.querySelector('.irr-breadcrumb-extra') : document.getElementById('irr-breadcrumb-extra');
    setPortalTarget(target || null);
    setHasChecked(true);
  }, []);

  const refreshBtn = onRefresh ? (
    <Tooltip title="Refresh">
      <Button
        icon={<ReloadOutlined />}
        onClick={onRefresh}
        loading={loading}
        aria-label="Refresh"
        className="irr-stats-refresh-btn"
      />
    </Tooltip>
  ) : null;

  return (
    <div ref={sectionRef} className="irr-stats-section" style={style}>
      {portalTarget && refreshBtn && createPortal(refreshBtn, portalTarget)}
      {!portalTarget && hasChecked && refreshBtn && (
        <div className="irr-stats-refresh-bar">
          {refreshBtn}
        </div>
      )}
      {children}
    </div>
  );
}

