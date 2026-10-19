import { Table, Tag } from 'antd';
import { BuildOutlined } from '@ant-design/icons';
import { EMPTY_TEXT, fmt } from '../shared/reportUtils';

const n = (v) => Number(v) || 0;

const columns = [
  { title: 'Administrative Zone (ዞን)', dataIndex: 'zone', key: 'zone', render: (z) => <strong style={{ color: '#1a5f2c' }}>{z}</strong> },
  {
    title: 'Studies Underway (በጥናት ላይ ያሉ)', key: 'modality',
    render: (_, r) => <span style={{ fontSize: 12 }}>Total: <strong>{r.total_pipeline}</strong> (Consultant: {r.consultant_studies} | In-House: {r.inhouse_studies})</span>,
  },
  { title: 'Command Area (ሄ/ር)', dataIndex: 'command_area_ha', key: 'command_area_ha', render: (a) => `${fmt(a)} Ha` },
  {
    title: 'Target Beneficiaries (ተጠቃሚዎች)', key: 'farmers',
    render: (_, r) => <span style={{ fontSize: 11 }}>{fmt(n(r.beneficiaries_male) + n(r.beneficiaries_female))} (M: {r.beneficiaries_male} / F: {r.beneficiaries_female})</span>,
  },
  { title: 'QA Passed (ጥራት የተረጋገጠ)', dataIndex: 'qa_passed_count', key: 'qa_passed_count', render: (q) => <Tag color="green">{q} Schemes</Tag> },
  {
    title: 'Construction-Ready (ለግንባታ ዝግጁ)', dataIndex: 'construction_ready_count', key: 'construction_ready_count',
    render: (c) => <Tag color="success" icon={<BuildOutlined />}>{c} Schemes</Tag>,
  },
  {
    title: 'Trained Staff (የሰለጠኑ ባለሙያዎች)', key: 'trained',
    render: (_, r) => <span style={{ fontSize: 11 }}>{n(r.experts_trained_male) + n(r.experts_trained_female)} Staff (M: {r.experts_trained_male} / F: {r.experts_trained_female})</span>,
  },
];

export default function StudyDesignTable({ rows, loading }) {
  return <Table columns={columns} dataSource={rows} rowKey="key" loading={loading} pagination={false} bordered size="middle" locale={{ emptyText: EMPTY_TEXT }} />;
}
