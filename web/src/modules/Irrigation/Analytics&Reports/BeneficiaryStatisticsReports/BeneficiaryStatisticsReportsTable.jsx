import { Progress, Table, Tag } from 'antd';
import { EMPTY_TEXT, NOT_TRACKED, fmt } from '../shared/reportUtils';

const isNull = (v) => v === null || v === undefined;

const columns = [
  { title: 'Administrative Zone (ዞን)', dataIndex: 'zone', key: 'zone', render: (z) => <strong style={{ color: '#1a5f2c' }}>{z}</strong> },
  {
    title: 'Schemes & Command (Ha)', key: 'schemes_command',
    render: (_, r) => (
      <div>
        <span><strong>{r.schemes_count}</strong> Schemes ({r.woreda_count} Woredas)</span>
        <div style={{ color: '#5b8a6b', fontSize: 11 }}>{fmt(r.command_area_ha)} Ha Command</div>
      </div>
    ),
  },
  { title: 'Male Farmers (ወንድ)', dataIndex: 'farmers_male', key: 'farmers_male', render: (m) => <span style={{ fontWeight: 600, color: '#5b8a6b' }}>{fmt(m)}</span> },
  { title: 'Female Farmers (ሴት)', dataIndex: 'farmers_female', key: 'farmers_female', render: (f) => <span style={{ fontWeight: 600, color: '#64748b' }}>{fmt(f)}</span> },
  { title: 'Total Farmers (ድምር)', dataIndex: 'total_farmers', key: 'total_farmers', render: (t) => <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{fmt(t)}</strong> },
  {
    title: 'Gender Inclusivity Rate (%)', key: 'gender_rate', width: 190,
    render: (_, r) => (
      <div style={{ minWidth: 120 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
          <span style={{ fontWeight: 700, color: '#64748b' }}>{r.female_share_pct}%</span>
          <span style={{ color: '#8c8c8c' }}>FHH: {isNull(r.female_headed_households) ? NOT_TRACKED : r.female_headed_households}</span>
        </div>
        <Progress percent={Number(r.female_share_pct) || 0} showInfo={false} size="small" strokeColor="#64748b" />
      </div>
    ),
  },
  { title: 'Youth Inclusivity (ወጣቶች)', dataIndex: 'youth_farmers', key: 'youth_farmers', render: (y) => <Tag color="orange">{fmt(y)} Youth</Tag> },
  {
    title: 'WUA Members vs Wheat Farmers', key: 'cross_program',
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>WUA Registry: <strong>{fmt(r.wua_members_total)}</strong></div>
        <div style={{ color: '#1a5f2c' }}>Wheat Initiative: {fmt(r.wheat_initiative_farmers)}</div>
      </div>
    ),
  },
];

export default function BeneficiaryTable({ rows, loading }) {
  return (
    <Table columns={columns} dataSource={rows} rowKey="key" loading={loading} pagination={false}
      scroll={{ x: 1350 }} bordered size="middle" locale={{ emptyText: EMPTY_TEXT }} />
  );
}
