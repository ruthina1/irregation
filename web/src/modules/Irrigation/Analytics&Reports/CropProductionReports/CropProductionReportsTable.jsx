import { Table } from 'antd';
import { EMPTY_TEXT, fmt } from '../shared/reportUtils';

const n = (v) => Number(v) || 0;

const columns = [
  { title: 'Administrative Zone (ዞን)', dataIndex: 'zone', key: 'zone', render: (z) => <strong style={{ color: '#1a5f2c' }}>{z}</strong> },
  { title: 'Cultivated Land (የለማ መሬት)', dataIndex: 'cultivated_ha', key: 'cultivated_ha', render: (ha) => <strong>{fmt(ha)} Ha</strong> },
  {
    title: 'Total Harvest (ጠቅላላ ምርት በኩንታል)', dataIndex: 'total_yield_qt', key: 'total_yield_qt',
    render: (y) => <strong style={{ color: '#a16207', fontSize: 13 }}>{fmt(y)} Qt</strong>,
  },
  {
    title: 'Highland Wheat Flagship (የደጋ ስንዴ)', key: 'wheat',
    render: (_, r) => (
      <span style={{ fontSize: 11 }}>
        <strong style={{ color: '#1a5f2c' }}>{fmt(r.wheat_yield_qt)} Qt</strong> ({r.wheat_ha} Ha)
      </span>
    ),
  },
  {
    title: 'Beneficiary Farmers (ተጠቃሚዎች)', key: 'farmers',
    render: (_, r) => (
      <span style={{ fontSize: 11 }}>
        {fmt(n(r.farmers_male) + n(r.farmers_female))} (M: {r.farmers_male} / F: {r.farmers_female})
      </span>
    ),
  },
  {
    title: 'Agricultural Inputs (ግብዓት)', key: 'inputs',
    render: (_, r) => <span style={{ fontSize: 11, color: '#595959' }}>Fertilizer: {r.fertilizer_qt} Qt | Seed: {r.seed_qt} Qt</span>,
  },
];

export default function CropProductionTable({ rows, loading }) {
  return (
    <Table columns={columns} dataSource={rows} rowKey="key" loading={loading} pagination={false}
      bordered size="middle" locale={{ emptyText: EMPTY_TEXT }} />
  );
}
