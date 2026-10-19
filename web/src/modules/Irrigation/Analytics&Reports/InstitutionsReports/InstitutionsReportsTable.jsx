import { Table, Tag } from 'antd';
import { EMPTY_TEXT, fmt } from '../shared/reportUtils';

const columns = [
  { title: 'Administrative Zone (ዞን)', dataIndex: 'zone', key: 'zone', render: (z) => <strong style={{ color: '#1a5f2c' }}>{z}</strong> },
  {
    title: 'WUAs (አዲስ / የተጠናከሩ)', key: 'wuas',
    render: (_, r) => (
      <span>
        <strong>{r.total_wuas}</strong> (New: <Tag color="default">{r.new_wuas}</Tag> | Strengthened: <Tag color="default">{r.strengthened_wuas}</Tag>)
      </span>
    ),
  },
  {
    title: 'Audited & Compliant (ኦዲት)', key: 'audit',
    render: (_, r) => <span>{r.audited_wuas} Audited (Clean: <Tag color="success">{r.unqualified_audits}</Tag>)</span>,
  },
  {
    title: 'Canal Maintenance (በዘመናዊ / በባህላዊ)', key: 'canals',
    render: (_, r) => (
      <span style={{ fontSize: 11 }}>
        Modern: <strong>{r.modern_canal_maintained_km} km</strong> | Traditional: <strong>{r.traditional_canal_maintained_km} km</strong>
      </span>
    ),
  },
  { title: 'Mobilized Labor (የሰው ኃይል)', dataIndex: 'community_labor_count', key: 'community_labor_count', render: (l) => `${fmt(l)} Farmers` },
  { title: 'Total Members (ተጠቃሚ አባላት)', dataIndex: 'wua_members_total', key: 'wua_members_total', render: (m) => <strong style={{ color: '#1a5f2c' }}>{fmt(m)}</strong> },
];

export default function InstitutionsTable({ rows, loading }) {
  return (
    <Table columns={columns} dataSource={rows} rowKey="key" loading={loading} pagination={false}
      bordered size="middle" locale={{ emptyText: EMPTY_TEXT }} />
  );
}
