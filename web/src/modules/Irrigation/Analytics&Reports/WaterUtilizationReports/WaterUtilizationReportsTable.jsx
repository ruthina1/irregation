import { Table, Tag } from 'antd';
import { EMPTY_TEXT, NOT_TRACKED, fmt } from '../shared/reportUtils';

const isNull = (v) => v === null || v === undefined;
const NotTracked = () => <span style={{ color: '#8c8c8c' }}>{NOT_TRACKED}</span>;

const columns = [
  { title: 'Administrative Zone (ዞን)', dataIndex: 'zone', key: 'zone', render: (z) => <strong style={{ color: '#1a5f2c' }}>{z}</strong> },
  {
    title: 'Seasonal Utilization (1ኛ / 2ኛ / 3ኛ ዙር)', key: 'seasonal',
    render: (_, r) => <span style={{ fontSize: 11 }}>R1: {r.round_1_ha} Ha | R2: {r.round_2_ha} Ha | R3: {r.round_3_ha} Ha</span>,
  },
  { title: 'Effective Command Area', dataIndex: 'total_effective_ha', key: 'total_effective_ha', render: (ha) => <strong style={{ color: '#1a5f2c' }}>{fmt(ha)} Ha</strong> },
  {
    title: 'Drip / Sprinkler Area (ጠብታ/ዘነባ)', dataIndex: 'drip_sprinkler_ha', key: 'drip_sprinkler_ha',
    render: (ha) => (isNull(ha) ? <NotTracked /> : <Tag color="default">{fmt(ha)} Ha</Tag>),
  },
  {
    title: 'Abstraction Tech (ፓምፕ / ዌል)', key: 'tech',
    render: (_, r) => (
      <span>
        <Tag color="green">Solar: {r.solar_pump_sites}</Tag>
        <Tag color="default">Wells: {r.deep_well_sites}</Tag>
      </span>
    ),
  },
  {
    title: 'Field Efficiency (%)', dataIndex: 'avg_application_efficiency_pct', key: 'avg_application_efficiency_pct',
    render: (eff) => (isNull(eff) ? <NotTracked /> : <strong>{eff}%</strong>),
  },
];

export default function WaterUtilizationTable({ rows, loading }) {
  return (
    <Table columns={columns} dataSource={rows} rowKey="key" loading={loading} pagination={false}
      bordered size="middle" locale={{ emptyText: EMPTY_TEXT }} />
  );
}
