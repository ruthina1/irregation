import { Button, Popconfirm, Progress, Select, Space, Table, Tag, Tooltip } from 'antd';
import {
  DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, FileSearchOutlined,
} from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { QA_STATUSES, scoreColor } from './DesignQualityAssuranceManagement';

const buildColumns = ({ onView, onEdit, onDelete, onStatusChange, onOpenReview }) => [
  {
    title: 'Certificate No & Scheme Name',
    key: 'cert_info',
    width: 270,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Cert: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.qa_certificate_no}</span> | Ref:{' '}
          <Tag color="green" style={{ fontSize: 10 }}>{r.project_code}</Tag>
        </div>
      </div>
    ),
  },
  {
    title: 'Linked Document Review (Prerequisite Gate)',
    key: 'linked_review',
    width: 250,
    render: (_, r) => (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tag color={r.review_cleared ? 'success' : 'warning'} style={{ margin: 0, fontSize: 11 }}>
            {r.review_verdict_snapshot}
          </Tag>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#1a5f2c' }}>{toNumber(r.review_score_snapshot)}%</span>
        </div>
        <div style={{ marginTop: 2 }}>
          <Button
            type="link"
            size="small"
            icon={<FileSearchOutlined />}
            style={{ padding: 0, fontSize: 11, height: 'auto', color: '#5b8a6b' }}
            onClick={() => onOpenReview(r.linked_review_code)}
          >
            View Review Details ({r.linked_review_code})
          </Button>
        </div>
      </div>
    ),
  },
  {
    title: 'QA Focus Domain',
    dataIndex: 'qa_domain',
    key: 'qa_domain',
    width: 220,
    render: (domain) => <span style={{ fontSize: 12, fontWeight: 500 }}>{domain}</span>,
  },
  {
    title: 'Command Area',
    dataIndex: 'command_area_ha',
    key: 'command_area_ha',
    width: 120,
    render: (ha) => <strong style={{ color: '#1a5f2c' }}>{toNumber(ha).toLocaleString()} Ha</strong>,
  },
  {
    title: 'Compliance Score',
    dataIndex: 'compliance_score',
    key: 'compliance_score',
    width: 130,
    render: (value) => {
      const score = toNumber(value);
      return (
        <div style={{ minWidth: 90 }}>
          <div style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontWeight: 700, color: scoreColor(score) }}>{score}%</span>
            <span style={{ color: '#8c8c8c', fontSize: 10 }}>{score >= 85 ? 'Passed' : 'Audit'}</span>
          </div>
          <Progress percent={score} showInfo={false} size="small" strokeColor={scoreColor(score)} />
        </div>
      );
    },
  },
  {
    title: 'Location',
    key: 'station',
    width: 160,
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
    title: 'Action Plan: QA Certification',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 260,
    render: (_, record) => (
      <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Select
          value={record.qa_status || 'Under QA Audit'}
          onChange={(value) => onStatusChange(record, value)}
          size="small"
          style={{ width: 170 }}
          popupMatchSelectWidth={false}
          aria-label="QA certification status"
          options={QA_STATUSES.map((s) => ({
            value: s.value,
            label: <Tag color={s.color} style={{ margin: 0 }}>{s.label}</Tag>,
          }))}
        />
        <Space size="small">
          <Tooltip title="View QA Certification Dossier">
            <Button type="text" size="small" aria-label="View QA dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Edit QA Audit Session">
            <Button type="text" size="small" aria-label="Edit QA audit" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete QA dossier?"
            description="Are you sure you want to delete this QA record?"
            onConfirm={() => onDelete(record)}
          >
            <Button type="text" size="small" danger aria-label="Delete QA audit" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </Space>
    ),
  },
];

export default function DesignQualityAssuranceTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No QA audits registered for this fiscal year' }}
    />
  );
}
