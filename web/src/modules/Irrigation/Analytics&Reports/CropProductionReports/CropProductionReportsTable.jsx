import { Button, Table, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { EMPTY_TEXT, fmt } from '../shared/reportUtils';

const n = (v) => Number(v) || 0;

export default function CropProductionTable({ rows = [], loading, onView }) {
  const columns = [
    {
      title: 'Administrative Zone (ዞን)',
      dataIndex: 'zone',
      key: 'zone',
      width: 180,
      render: (z) => <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{z}</strong>,
    },
    {
      title: 'Cultivated Land (የለማ መሬት)',
      dataIndex: 'cultivated_ha',
      key: 'cultivated_ha',
      width: 170,
      render: (ha) => <strong>{fmt(ha)} Ha</strong>,
    },
    {
      title: 'Total Harvest (ጠቅላላ ምርት)',
      dataIndex: 'total_yield_qt',
      key: 'total_yield_qt',
      width: 180,
      render: (y) => <strong style={{ color: '#a16207', fontSize: 13 }}>{fmt(y)} Qt</strong>,
    },
    {
      title: 'Highland Wheat (የደጋ ስንዴ)',
      key: 'wheat',
      width: 180,
      render: (_, r) => (
        <span style={{ fontSize: 12 }}>
          <strong style={{ color: '#1a5f2c' }}>{fmt(r.wheat_yield_qt)} Qt</strong> ({r.wheat_ha ?? 0} Ha)
        </span>
      ),
    },
    {
      title: 'Beneficiary Farmers',
      key: 'farmers',
      width: 160,
      render: (_, r) => (
        <span style={{ fontSize: 12 }}>
          {fmt(n(r.farmers_male) + n(r.farmers_female))} Farmers
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Tooltip title="View Full Crop Production Dossier">
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
