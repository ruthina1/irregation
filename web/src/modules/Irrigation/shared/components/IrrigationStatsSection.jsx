import { Button, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import '../irrigation.css';

/**
 * Wraps status / KPI cards on Irrigation pages, placing the refresh button in the
 * top-right corner of the status cards section (aligned above the rightmost card).
 */
export default function IrrigationStatsSection({ onRefresh, loading = false, children, style }) {
  return (
    <div className="irr-stats-section" style={style}>
      {onRefresh && (
        <div className="irr-stats-refresh-bar">
          <Tooltip title="Refresh">
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
              aria-label="Refresh"
              className="irr-stats-refresh-btn"
            />
          </Tooltip>
        </div>
      )}
      {children}
    </div>
  );
}
