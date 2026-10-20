import { Button, Table, Tag, Tooltip } from 'antd';
import { BuildOutlined, EyeOutlined } from '@ant-design/icons';
import { EMPTY_TEXT, fmt } from '../shared/reportUtils';

const n = (v) => Number(v) || 0;

export default function StudyDesignTable({ rows = [], loading, onView }) {
  const columns = [
    {
      title: 'Administrative Zone (ዞን)',
      dataIndex: 'zone',
      key: 'zone',
      width: 180,
      render: (z) => <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{z}</strong>,
    },
    {
      title: 'Studies Underway (በጥናት ላይ ያሉ)',
      key: 'modality',
      width: 220,
      render: (_, r) => (
        <span style={{ fontSize: 12 }}>
          Total: <strong>{r.total_pipeline ?? 0}</strong> (Consultant: {r.consultant_studies ?? 0} | In-House: {r.inhouse_studies ?? 0})
        </span>
      ),
    },
    {
      title: 'Ready Shelf (ለግንባታ ዝግጁ)',
      dataIndex: 'construction_ready_count',
      key: 'construction_ready_count',
      width: 160,
      render: (c) => <Tag color="success" icon={<BuildOutlined />}>{c ?? 0} Ready</Tag>,
    },
    {
      title: 'Command Area (ሄ/ር)',
      dataIndex: 'command_area_ha',
      key: 'command_area_ha',
      width: 160,
      render: (a) => <strong style={{ color: '#1a5f2c' }}>{fmt(a)} Ha</strong>,
    },
    {
      title: 'Target Farmers',
      key: 'farmers',
      width: 160,
      render: (_, r) => <span>{fmt(n(r.beneficiaries_male) + n(r.beneficiaries_female))} Farmers</span>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Tooltip title="View Full Study Dossier">
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
