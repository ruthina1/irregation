import { useMemo } from 'react';
import { Empty, Select } from 'antd';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fmt, LIGHT_GRAPH_COLORS } from './reportUtils';

/**
 * Dropdown placed in the right top corner of chart cards (Card `extra`)
 * to filter by specific zone / dimension.
 */
export function ZoneSelect({
  zones = [],
  value = 'all',
  onChange,
  allLabel = 'All Zones (ሁሉም ዞኖች)',
  placeholder = 'Select Zone',
  style,
}) {
  const options = useMemo(() => [
    { value: 'all', label: allLabel },
    ...zones.filter(Boolean).map((z) => ({ value: z, label: z })),
  ], [zones, allLabel]);

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      style={{ width: 190, ...style }}
      size="middle"
      aria-label="Filter chart by zone"
    />
  );
}

/**
 * Interactive Zonal Bar Chart:
 * - When `selectedZone === 'all'`: displays comparison across all zones on the X-axis.
 * - When a specific zone is selected: zooms into that zone and displays its features
 *   (column listed attributes) as distinct bars on the X-axis with exact value labels.
 */
export default function ZoneBarChart({
  rows = [],
  bars = [],
  unit = '',
  selectedZone = 'all',
  zoneKey = 'zone',
  height = 260,
  tooltipFormatter,
}) {
  const safeRows = Array.isArray(rows) ? rows : [];

  // Single zone selected: display its features (column listed attributes)
  if (selectedZone && selectedZone !== 'all') {
    const zoneRow = safeRows.find(
      (r) => String(r[zoneKey] || '').toLowerCase() === String(selectedZone).toLowerCase()
    );

    if (!zoneRow) {
      return (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description={`No data recorded for ${selectedZone}`} />
        </div>
      );
    }

    const featureData = bars.map((b) => ({
      feature: b.name,
      value: Number(zoneRow[b.dataKey]) || 0,
      fill: b.fill,
    }));

    return (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={featureData} barSize={42} margin={{ top: 20, right: 16, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="feature" tick={{ fontSize: 11 }} interval={0} />
            <YAxis tick={{ fontSize: 11 }} unit={unit} />
            <Tooltip
              formatter={
                tooltipFormatter ||
                ((val, name, item) => [`${fmt(val)}${unit}`, item?.payload?.feature || name])
              }
            />
            <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="value"
                position="top"
                formatter={(v) => `${fmt(v)}${unit}`}
                style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
              />
              {featureData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // All zones comparison view
  return (
    <div style={{ height }}>
      {safeRows.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={safeRows} barSize={26} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey={zoneKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit={unit} />
            <Tooltip
              formatter={
                tooltipFormatter ||
                ((val, name) => [`${fmt(val)}${unit}`, name])
              }
            />
            {bars.map((b) => (
              <Bar
                key={b.dataKey}
                dataKey={b.dataKey}
                name={b.name}
                fill={b.fill}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Empty description="No data for this fiscal year" />
      )}
    </div>
  );
}
