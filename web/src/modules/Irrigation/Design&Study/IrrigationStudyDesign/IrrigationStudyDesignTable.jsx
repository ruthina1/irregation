import { Button, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import {
  CheckCircleOutlined, DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { REVIEW_VERIFIED, isQaPassed, modalityColor } from './IrrigationStudyDesignManagement';

const buildColumns = ({ onView, onReviewQa, onEdit, onDelete }) => [
  {
    title: 'Project Code & Scheme Name',
    key: 'project_info',
    width: 280,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.project_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Code: <span style={{ fontFamily: 'monospace' }}>{r.project_code}</span> | {r.water_source?.split(' ')[0]}
        </div>
        {r.pipeline_code && (
          <div style={{ fontSize: 10, color: '#8c8c8c' }}>
            From pipeline: <span style={{ fontFamily: 'monospace' }}>{r.pipeline_code}</span>
          </div>
        )}
      </div>
    ),
  },
  {
    title: 'Study Modality / Lead',
    dataIndex: 'study_modality',
    key: 'study_modality',
    width: 220,
    render: (modality, r) => (
      <div>
        <Tag color={modalityColor(modality)}>{modality}</Tag>
        {r.lead_consultant_or_office && (
          <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>{r.lead_consultant_or_office}</div>
        )}
      </div>
    ),
  },
  {
    title: 'Study Stage',
    dataIndex: 'study_stage',
    key: 'study_stage',
    width: 200,
    render: (stage = '') => {
      const done = stage.includes('Completed');
      return <span style={{ fontSize: 12, fontWeight: done ? 600 : 400, color: done ? '#1a5f2c' : '#595959' }}>{stage}</span>;
    },
  },
  {
    title: 'Command Area',
    dataIndex: 'command_area_hectares',
    key: 'command_area_hectares',
    width: 140,
    render: (ha) => <strong style={{ color: '#1a5f2c' }}>{toNumber(ha).toLocaleString()} Ha</strong>,
  },
  {
    title: 'Target Beneficiaries',
    key: 'beneficiaries',
    width: 170,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Total: <strong>{(toNumber(r.beneficiaries_male) + toNumber(r.beneficiaries_female)).toLocaleString()}</strong></div>
        <div style={{ color: '#8c8c8c' }}>
          M: <span style={{ color: '#5b8a6b' }}>{toNumber(r.beneficiaries_male)}</span> |
          F: <span style={{ color: '#64748b' }}>{toNumber(r.beneficiaries_female)}</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Document Review & QA Status',
    key: 'review_qa',
    width: 250,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>
          Review:{' '}
          <Tag color={r.review_status === REVIEW_VERIFIED ? 'success' : 'processing'} style={{ fontSize: 10, margin: 0 }}>
            {r.review_status === REVIEW_VERIFIED ? 'Verified' : 'Under Review'}
          </Tag>
        </div>
        {r.latest_review_code && (
          <Tooltip title={`Latest design review ${r.latest_review_code}: ${r.latest_review_verdict}`}>
            <div style={{ color: r.review_cleared ? '#2f7d4a' : '#8c8c8c', fontSize: 10, marginTop: 2 }}>
              {r.latest_review_code} · {r.latest_review_verdict}
              {r.latest_review_score !== null && r.latest_review_score !== undefined ? ` · ${r.latest_review_score}/100` : ''}
            </div>
          </Tooltip>
        )}
        <div style={{ marginTop: 2 }}>
          QA:{' '}
          <Tag color={isQaPassed(r.qa_status) ? 'green' : 'warning'} style={{ fontSize: 10, margin: 0 }}>
            {isQaPassed(r.qa_status) ? 'QA Passed' : 'Pending'}
          </Tag>
        </div>
      </div>
    ),
  },
  {
    title: 'Construction Ready?',
    dataIndex: 'is_construction_ready',
    key: 'is_construction_ready',
    width: 150,
    align: 'center',
    render: (ready) => (
      <Tag color={ready ? 'success' : 'default'} icon={ready ? <CheckCircleOutlined /> : null}>
        {ready ? 'Ready for Build' : 'Pending Study'}
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
        <Tooltip title="View Project Dossier">
          <Button type="text" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
        </Tooltip>
        <Tooltip title="Review & Quality Assurance">
          <Button type="text" aria-label="Review and QA" icon={<SafetyCertificateOutlined style={{ color: '#a16207' }} />} onClick={() => onReviewQa(record)} />
        </Tooltip>
        <Tooltip title="Edit Study Record">
          <Button type="text" aria-label="Edit study record" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
        </Tooltip>
        <Popconfirm
          title="Delete study record?"
          description="Are you sure you want to delete this study & design record?"
          onConfirm={() => onDelete(record)}
        >
          <Button type="text" danger aria-label="Delete study record" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  },
];

export default function IrrigationStudyDesignTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1470 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No study & design projects registered for this fiscal year' }}
    />
  );
}
