import { Progress, Table, Tag } from 'antd';
import { EMPTY_TEXT, fmt, millions } from '../shared/reportUtils';

/** Average progress is null when the channel has no scheme of that type. */
const ProgressValue = ({ value, good, goodColor, badColor }) => {
  if (value === null || value === undefined) return <span style={{ color: '#8c8c8c' }}>No schemes</span>;
  return <span style={{ fontWeight: 700, color: value >= good ? goodColor : badColor }}>{value}%</span>;
};

const columns = [
  { title: 'Financing Channel (የበጀት ምንጭ/ፕሮግራም)', dataIndex: 'program', key: 'program', render: (p) => <strong style={{ color: '#1a5f2c' }}>{p}</strong> },
  {
    title: 'Schemes (አዲስ / ነባር)', key: 'schemes',
    render: (_, r) => (
      <span>
        <Tag color="default">New: {r.new_schemes_count}</Tag>
        <Tag color="gold">Rehab: {r.existing_rehab_count}</Tag>
      </span>
    ),
  },
  {
    title: 'New Scheme Progress (አማካይ 66% ግብ)', dataIndex: 'avg_new_physical_pct', key: 'avg_new_physical_pct',
    render: (v) => <ProgressValue value={v} good={66} goodColor="#1a5f2c" badColor="#a16207" />,
  },
  {
    title: 'Rehab Scheme Progress (አማካይ 30.3% መነሻ)', dataIndex: 'avg_rehab_physical_pct', key: 'avg_rehab_physical_pct',
    render: (v) => <ProgressValue value={v} good={30} goodColor="#5b8a6b" badColor="#b42318" />,
  },
  {
    title: 'Disbursed Budget / Allocation', key: 'budget',
    render: (_, r) => {
      const allocated = Number(r.allocated_budget_etb) || 0;
      const rate = allocated > 0 ? Math.round(((Number(r.disbursed_etb) || 0) / allocated) * 100) : 0;
      return (
        <div style={{ fontSize: 11 }}>
          <strong>{millions(r.disbursed_etb)}M</strong> / {millions(r.allocated_budget_etb)}M ETB
          <Progress percent={rate} size="small" strokeColor="#1a5f2c" />
        </div>
      );
    },
  },
  { title: 'Command Area (ሄ/ር)', dataIndex: 'developed_land_ha', key: 'developed_land_ha', render: (ha) => <strong style={{ color: '#1a5f2c' }}>{fmt(ha)} Ha</strong> },
  { title: 'Beneficiaries (ተጠቃሚዎች)', dataIndex: 'beneficiaries_total', key: 'beneficiaries_total', render: (f) => `${fmt(f)} Farmers` },
];

export default function ConstructionProgramTable({ rows, loading }) {
  return (
    <Table columns={columns} dataSource={rows} rowKey="key" loading={loading} pagination={false}
      bordered size="middle" locale={{ emptyText: EMPTY_TEXT }} />
  );
}
