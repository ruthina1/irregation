import { Button, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { TRAINING_STATUSES } from './ProfessionalCapacityBuildingManagement';

const buildColumns = ({ onView, onEdit, onDelete, onStatusChange }) => [
  {
    title: 'Course Code & Title',
    key: 'course_info',
    width: 280,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.course_title}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Code: <span style={{ fontFamily: 'monospace' }}>{r.training_code}</span> | {r.discipline?.split('(')[0]}
        </div>
      </div>
    ),
  },
  {
    title: 'Target Institution Tier',
    dataIndex: 'target_tier',
    key: 'target_tier',
    width: 220,
    render: (tier) => <Tag color="default">{tier}</Tag>,
  },
  {
    title: 'Trained Experts (Gender Split)',
    key: 'participants',
    width: 190,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>
          Total: <strong style={{ color: '#1a5f2c', fontSize: 12 }}>{toNumber(r.male_participants) + toNumber(r.female_participants)} Experts</strong>
        </div>
        <div style={{ color: '#8c8c8c', marginTop: 1 }}>
          Male: <span style={{ color: '#5b8a6b', fontWeight: 600 }}>{r.male_participants}</span> |
          Female: <span style={{ color: '#64748b', fontWeight: 600 }}>{r.female_participants}</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Lead Trainer & Venue',
    key: 'trainer_venue',
    width: 210,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div style={{ fontWeight: 600, color: '#262626' }}>{r.lead_trainer}</div>
        <div style={{ color: '#8c8c8c' }}>{r.training_venue} ({r.training_duration_days} Days)</div>
      </div>
    ),
  },
  {
    title: 'Sponsoring Program',
    dataIndex: 'sponsoring_program',
    key: 'sponsoring_program',
    width: 200,
    render: (prog) => <Tag color="default">{prog}</Tag>,
  },
  {
    title: 'Location',
    key: 'station',
    width: 170,
    render: (_, r) => (
      <div style={{ fontSize: 12 }}>
        <Tooltip title={`${extractName(r.zone)} > ${extractName(r.woreda)}`}>
          <span>
            <EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} />
            <strong>{extractName(r.woreda)}</strong>
          </span>
        </Tooltip>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>{extractName(r.zone)}</div>
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
          aria-label="Course status"
          options={TRAINING_STATUSES.map((s) => ({
            value: s.value,
            label: <Tag color={s.color} style={{ margin: 0 }}>{s.label}</Tag>,
          }))}
        />
        <Space size="small">
          <Tooltip title="View Training Dossier">
            <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Edit Course Details">
            <Button type="text" size="small" aria-label="Edit course" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete training record?"
            description="Are you sure you want to remove this capacity building record?"
            onConfirm={() => onDelete(record)}
          >
            <Button type="text" size="small" danger aria-label="Delete course" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </Space>
    ),
  },
];

export default function ProfessionalCapacityBuildingTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1400 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No capacity building courses recorded for this fiscal year' }}
    />
  );
}
