import { Button, Table, Tag, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { EMPTY_TEXT, fmt } from '../shared/reportUtils';

export default function WaterUtilizationTable({ rows = [], loading, onView }) {
  const columns = [
    {
      title: 'Administrative Zone (ዞን)',
      dataIndex: 'zone',
      key: 'zone',
      width: 180,
      render: (z) => <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{z}</strong>,
    },
    {
      title: 'Effective Command Area',
      dataIndex: 'total_effective_ha',
      key: 'total_effective_ha',
      width: 180,
      render: (ha) => <strong style={{ color: '#1a5f2c' }}>{fmt(ha)} Ha</strong>,
    },
    {
      title: 'Seasonal Utilization (1ኛ/2ኛ/3ኛ ዙር)',
      key: 'seasonal',
      width: 220,
      render: (_, r) => (
        <span style={{ fontSize: 12 }}>
          R1: <strong>{r.round_1_ha ?? 0}</strong> | R2: <strong>{r.round_2_ha ?? 0}</strong> | R3: <strong>{r.round_3_ha ?? 0} Ha</strong>
        </span>
      ),
    },
    {
      title: 'Abstraction Tech (ፓምፕ/ዌል)',
      key: 'tech',
      width: 180,
      render: (_, r) => (
        <span>
          <Tag color="green">Solar: {r.solar_pump_sites ?? 0}</Tag>
          <Tag color="default">Wells: {r.deep_well_sites ?? 0}</Tag>
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Tooltip title="View Full Water Utilization Dossier">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined style={{ color: '#1a5f2c', fontSize: 15 }} />}
            onClick={(e) => {
              e.stopPropagation();
              onView?.(r);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={rows}
      rowKey={(r) => r.zone || r.key || Math.random()}
      loading={loading}
      pagination={false}
      bordered
      size="middle"
      locale={{ emptyText: EMPTY_TEXT }}
      onRow={(record) => ({
        onClick: () => onView?.(record),
        style: { cursor: 'pointer' },
        className: 'irr-table-clickable-row',
      })}
    />
  );
}
