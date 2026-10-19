import { Button, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import {
  CheckCircleOutlined, CompassOutlined, DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined,
} from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { PRIORITY_COLORS, STATUS_COLORS } from './ProjectIdentificationPipelineManagement';

const buildColumns = ({ onView, onScreen, onEdit, onDelete }) => [
  {
    title: 'Pipeline Code & Scheme Name',
    key: 'pipeline_info',
    width: 270,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Code: <span style={{ fontFamily: 'monospace' }}>{r.pipeline_code}</span> | {r.water_source?.split(' ')[0]}
        </div>
      </div>
    ),
  },
  {
    title: 'Source of Initiative',
    dataIndex: 'initiative_source',
    key: 'initiative_source',
    width: 230,
    render: (src) => <Tag color="default">{src}</Tag>,
  },
  {
    title: 'Potential Area',
    dataIndex: 'potential_area_ha',
    key: 'potential_area_ha',
    width: 140,
    render: (ha) => <strong style={{ color: '#1a5f2c' }}>{toNumber(ha).toLocaleString()} Ha</strong>,
  },
  {
    title: 'Target Beneficiaries',
    key: 'beneficiaries',
    width: 170,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>
          Total: <strong>{(toNumber(r.estimated_beneficiaries_male) + toNumber(r.estimated_beneficiaries_female)).toLocaleString()}</strong>
        </div>
        <div style={{ color: '#8c8c8c' }}>
          M: <span style={{ color: '#5b8a6b' }}>{toNumber(r.estimated_beneficiaries_male)}</span> |
          F: <span style={{ color: '#64748b' }}>{toNumber(r.estimated_beneficiaries_female)}</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Priority',
    dataIndex: 'priority_level',
    key: 'priority_level',
    width: 140,
    render: (pri) => <Tag color={PRIORITY_COLORS[pri] || 'default'}>{pri}</Tag>,
  },
  {
    title: 'Pipeline Screening Status',
    dataIndex: 'pipeline_status',
    key: 'pipeline_status',
    width: 220,
    render: (status) => <Tag color={STATUS_COLORS[status] || 'default'}>{status}</Tag>,
  },
  {
    title: 'Promoted to Study?',
    dataIndex: 'promoted_to_study',
    key: 'promoted_to_study',
    width: 160,
    align: 'center',
    render: (promoted) => (
      <Tag color={promoted ? 'green' : 'default'} icon={promoted ? <CheckCircleOutlined /> : null}>
        {promoted ? 'Promoted to Design' : 'In Pipeline'}
      </Tag>
    ),
  },
  {
    title: 'Location',
    key: 'station',
    width: 180,
    render: (_, r) => (
      <div style={{ fontSize: 12 }}>
        <Tooltip title={`${extractName(r.zone)} > ${extractName(r.woreda)}`}>
          <span>
            <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
            <strong>{extractName(r.kebele)}</strong>
          </span>
        </Tooltip>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>{extractName(r.zone)} &gt; {extractName(r.woreda)}</div>
      </div>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    align: 'center',
    fixed: 'right',
    width: 160,
    render: (_, record) => (
      <Space size="small">
        <Tooltip title="View Pipeline Dossier">
          <Button type="text" aria-label="View pipeline dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
        </Tooltip>
        <Tooltip title="Field Reconnaissance & Screening">
          <Button type="text" aria-label="Field reconnaissance and screening" icon={<CompassOutlined style={{ color: '#a16207' }} />} onClick={() => onScreen(record)} />
        </Tooltip>
        <Tooltip title="Edit Pipeline Record">
          <Button type="text" aria-label="Edit pipeline record" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
        </Tooltip>
        <Popconfirm
          title="Delete pipeline project?"
          description="Are you sure you want to remove this identified scheme?"
          onConfirm={() => onDelete(record)}
        >
          <Button type="text" danger aria-label="Delete pipeline project" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  },
];

export default function ProjectIdentificationPipelineTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No pipeline schemes identified for this fiscal year' }}
    />
  );
}
