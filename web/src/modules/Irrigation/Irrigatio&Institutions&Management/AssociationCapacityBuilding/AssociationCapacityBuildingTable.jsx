import { Button, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { TRAINING_STATUSES } from './AssociationCapacityBuildingManagement';

const buildColumns = ({ onView, onEdit, onDelete, onStatusChange, onOpenWua }) => [
  {
    title: 'Course Code & Association Name',
    key: 'wua_info',
    width: 280,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.wua_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Code: <span style={{ fontFamily: 'monospace' }}>{r.training_code}</span> | WUA:
          <Tooltip title="View WUA in Master Registry">
            <Tag color="default" style={{ fontSize: 10, cursor: 'pointer', marginLeft: 4 }} onClick={() => onOpenWua(r)}>
              <LinkOutlined style={{ marginRight: 2 }} />{r.wua_reg_code}
            </Tag>
          </Tooltip>
        </div>
        <div style={{ fontSize: 11, color: '#5b8a6b', marginTop: 2 }}>
          Scheme: <strong>{r.scheme_name}</strong>
        </div>
      </div>
    ),
  },
  {
    title: 'Curriculum Module',
    dataIndex: 'training_module',
    key: 'training_module',
    width: 240,
    render: (m) => <span style={{ fontSize: 12, fontWeight: 500 }}>{m}</span>,
  },
  {
    title: 'Leadership Trainees (በማህበሩ አመራር)',
    key: 'exec_trainees',
    width: 190,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Total Leaders: <strong style={{ color: '#1a5f2c' }}>{toNumber(r.exec_leaders_male) + toNumber(r.exec_leaders_female)} Leaders</strong></div>
        <div style={{ color: '#8c8c8c' }}>
          M: <span style={{ color: '#5b8a6b', fontWeight: 600 }}>{r.exec_leaders_male}</span> |
          F: <span style={{ color: '#64748b', fontWeight: 600 }}>{r.exec_leaders_female}</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Member Trainees (አባላት)',
    key: 'member_trainees',
    width: 170,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Total Members: <strong>{toNumber(r.members_male) + toNumber(r.members_female)} Farmers</strong></div>
        <div style={{ color: '#8c8c8c' }}>M: {r.members_male} | F: {r.members_female}</div>
      </div>
    ),
  },
  {
    title: 'Lead Facilitator (በባለሙያ)',
    key: 'facilitator',
    width: 210,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div style={{ fontWeight: 600, color: '#262626' }}>{r.lead_facilitator}</div>
        <div style={{ color: '#8c8c8c' }}>{r.training_venue} ({r.training_duration_days} Days)</div>
      </div>
    ),
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
    title: 'Action Plan: Course Status & Controls',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 250,
    render: (_, record) => (
      <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Select
          value={record.training_status}
          onChange={(value) => onStatusChange(record, value)}
          size="small"
          style={{ width: 155 }}
          popupMatchSelectWidth={false}
          aria-label="Training status"
          options={TRAINING_STATUSES.map((s) => ({
            value: s.value,
            label: <Tag color={s.color} style={{ margin: 0 }}>{s.label}</Tag>,
          }))}
        />
        <Space size="small">
          <Tooltip title="View Course & Attendance Dossier">
            <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Edit Course Session">
            <Button type="text" size="small" aria-label="Edit training" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete training record?"
            description="Are you sure you want to remove this capacity building record?"
            onConfirm={() => onDelete(record)}
          >
            <Button type="text" size="small" danger aria-label="Delete training" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </Space>
    ),
  },
];

export default function TrainingTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No WUA training sessions logged for this fiscal year' }}
    />
  );
}
