import { Button, Select, Space, Table, Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, EyeOutlined, RightCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { toNumber } from '../../shared/utils';
import { ARCHIVED, HANDED_OVER, SHELF_STATUSES } from './ConstructionReadyDesignsManagement';

const buildColumns = ({ onView, onStatusChange, onHandover, onOpenContract }) => [
  {
    title: 'Shelf Code & Scheme Name',
    key: 'scheme_info',
    width: 280,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Shelf: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.shelf_code}</span> | Ref: <Tag color="green" style={{ fontSize: 10 }}>{r.project_code}</Tag>
        </div>
      </div>
    ),
  },
  {
    title: 'Command Area',
    dataIndex: 'command_area_ha',
    key: 'command_area_ha',
    width: 130,
    render: (ha) => <strong style={{ color: '#1a5f2c' }}>{toNumber(ha).toLocaleString()} Ha</strong>,
  },
  {
    title: 'Estimated Capital Budget',
    dataIndex: 'estimated_construction_etb',
    key: 'estimated_construction_etb',
    width: 170,
    render: (cost) => (
      <div>
        <span style={{ fontWeight: 700, color: '#5b8a6b' }}>{(toNumber(cost) / 1000000).toFixed(1)} M ETB</span>
        <div style={{ fontSize: 10, color: '#8c8c8c' }}>Priced BoQ Estimate</div>
      </div>
    ),
  },
  {
    title: 'Target Funding Channel',
    dataIndex: 'preferred_funding_channel',
    key: 'preferred_funding_channel',
    width: 220,
    render: (fund) => <Tag color="default">{(fund || 'Unspecified').split('(')[0]}</Tag>,
  },
  {
    title: 'QA Certification',
    dataIndex: 'qa_certificate_no',
    key: 'qa_certificate_no',
    width: 160,
    render: (cert) => (cert ? (
      <Tooltip title="Certified QA Passed">
        <Tag color="success" icon={<SafetyCertificateOutlined />}>{cert}</Tag>
      </Tooltip>
    ) : <Tag>Review/QA Cleared</Tag>),
  },
  {
    title: 'Action Plan: Procurement Status & Handover',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 330,
    render: (_, record) => (
      <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Select
          value={record.shelf_status}
          onChange={(value) => onStatusChange(record, value)}
          size="small"
          style={{ width: 170 }}
          popupMatchSelectWidth={false}
          aria-label="Shelf status"
          options={SHELF_STATUSES.map((s) => ({ value: s.value, label: <Tag color={s.color} style={{ margin: 0 }}>{s.label}</Tag> }))}
        />
        <Space size="small">
          <Tooltip title="View Project Bank Dossier">
            <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          {record.shelf_status === HANDED_OVER ? (
            <Tooltip title="View Contract on Construction Site">
              <Button size="small" type="dashed" icon={<CheckCircleOutlined style={{ color: '#2f7d4a' }} />} style={{ fontSize: 11, color: '#2f7d4a' }} onClick={() => onOpenContract(record)}>
                Active Contract
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title={record.shelf_status === ARCHIVED ? 'Archived designs must be restored to the shelf before handover' : 'Handover to Construction & Initialize Contract'}>
              <Button
                size="small"
                type="primary"
                icon={<RightCircleOutlined />}
                disabled={record.shelf_status === ARCHIVED}
                style={record.shelf_status === ARCHIVED ? { fontSize: 11 } : { backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontSize: 11 }}
                onClick={() => onHandover(record)}
              >
                Handover
              </Button>
            </Tooltip>
          )}
        </Space>
      </Space>
    ),
  },
];

export default function ConstructionReadyDesignsTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1400 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No construction-ready designs on the shelf for this fiscal year' }}
    />
  );
}
