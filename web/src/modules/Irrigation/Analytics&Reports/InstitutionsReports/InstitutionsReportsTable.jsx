import { Button, Table, Tag, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { EMPTY_TEXT, fmt } from '../shared/reportUtils';

export default function InstitutionsTable({ rows = [], loading, onView }) {
  const columns = [
    {
      title: 'Administrative Zone (ዞን)',
      dataIndex: 'zone',
      key: 'zone',
      width: 180,
      render: (z) => <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{z}</strong>,
    },
    {
      title: 'WUAs (አዲስ/የተጠናከሩ)',
      key: 'wuas',
      width: 220,
      render: (_, r) => (
        <span>
          <strong>{r.total_wuas ?? 0} WUAs</strong> (New: <Tag color="default">{r.new_wuas ?? 0}</Tag> | Strengthened: <Tag color="default">{r.strengthened_wuas ?? 0}</Tag>)
        </span>
      ),
    },
    {
      title: 'Audited & Compliant',
      key: 'audit',
      width: 180,
      render: (_, r) => <span>{r.audited_wuas ?? 0} Audited (Clean: <Tag color="success">{r.unqualified_audits ?? 0}</Tag>)</span>,
    },
    {
      title: 'Maintained Canals',
      key: 'canals',
      width: 200,
      render: (_, r) => (
        <span style={{ fontSize: 12 }}>
          Modern: <strong>{r.modern_canal_maintained_km ?? 0} km</strong> | Traditional: <strong>{r.traditional_canal_maintained_km ?? 0} km</strong>
        </span>
      ),
    },
    {
      title: 'Total Members',
      dataIndex: 'wua_members_total',
      key: 'wua_members_total',
      width: 160,
      render: (m) => <strong style={{ color: '#1a5f2c' }}>{fmt(m)} Members</strong>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Tooltip title="View Full Institutions Dossier">
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
