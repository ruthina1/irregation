import { Card, Table } from 'antd';
import { EMPTY_TEXT, NOT_TRACKED, fmt } from '../../Analytics&Reports/shared/reportUtils';

const tracked = (value, suffix = '') => (value === null || value === undefined ? NOT_TRACKED : `${fmt(value)}${suffix}`);

const columns = [
  { title: 'Zone', dataIndex: 'zone', key: 'zone', fixed: 'left' },
  { title: 'Round 1 (Ha)', dataIndex: 'round_1_ha', key: 'r1', align: 'right', render: (v) => fmt(v) },
  { title: 'Round 2 (Ha)', dataIndex: 'round_2_ha', key: 'r2', align: 'right', render: (v) => fmt(v) },
  { title: 'Round 3 (Ha)', dataIndex: 'round_3_ha', key: 'r3', align: 'right', render: (v) => fmt(v) },
  { title: 'Total Effective (Ha)', dataIndex: 'total_effective_ha', key: 'total', align: 'right', render: (v) => <strong>{fmt(v)}</strong> },
  { title: 'Drip / Sprinkler (Ha)', dataIndex: 'drip_sprinkler_ha', key: 'drip', align: 'right', render: (v) => tracked(v) },
  { title: 'Surface / Furrow (Ha)', dataIndex: 'surface_furrow_ha', key: 'furrow', align: 'right', render: (v) => tracked(v) },
  { title: 'Solar Pump Sites', dataIndex: 'solar_pump_sites', key: 'solar', align: 'right' },
  { title: 'Deep Well Sites', dataIndex: 'deep_well_sites', key: 'deep', align: 'right' },
  { title: 'Avg. Utilization', dataIndex: 'avg_utilization_rate_pct', key: 'util', align: 'right', render: (v) => tracked(v, '%') },
];

/** Zone-level water utilization summary (GET reports/water-utilization). */
export default function ZoneUtilizationTable({ rows, loading }) {
  return (
    <Card
      title={<span style={{ fontSize: 14, fontWeight: 600 }}>Zonal Water Utilization Summary</span>}
      variant="borderless"
      style={{ marginBottom: 20, borderRadius: 8 }}
    >
      <Table
        size="small"
        columns={columns}
        dataSource={rows}
        rowKey="key"
        loading={loading}
        pagination={false}
        scroll={{ x: 1000 }}
        locale={{ emptyText: EMPTY_TEXT }}
      />
    </Card>
  );
}
