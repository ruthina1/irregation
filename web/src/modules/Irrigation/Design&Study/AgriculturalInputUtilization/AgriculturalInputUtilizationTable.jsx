import { Button, Popconfirm, Progress, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { findInputOption, INPUT_STATUS_COLORS } from './AgriculturalInputUtilizationManagement';
import { deliveryPercent } from './AgriculturalInputUtilizationManagement';

const buildColumns = ({ onDispatch, onView, onEdit, onDelete }) => [
  {
    title: 'Input Name & Specification',
    key: 'item_info',
    width: 260,
    render: (_, r) => (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Tag color={findInputOption(r.input_name).color}>{r.input_name}</Tag>
          <span style={{ color: '#1a5f2c', fontWeight: 600 }}>{r.specification}</span>
        </div>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Code: <span style={{ fontFamily: 'monospace' }}>{r.input_code}</span> | {r.item_name}
        </div>
      </div>
    ),
  },
  {
    title: 'Irrigation Season',
    dataIndex: 'irrigation_season',
    key: 'irrigation_season',
    width: 180,
    render: (season) => (
      <Tag color={season === 'Bega Irrigation' ? 'gold' : 'default'}>
        {season === 'Bega Irrigation' ? 'Bega (Dry Season)' : 'Meher Supplemental'}
      </Tag>
    ),
  },
  {
    title: 'Cropping Round',
    dataIndex: 'cropping_round',
    key: 'cropping_round',
    width: 140,
    render: (round) => <span style={{ fontSize: 12 }}>{round}</span>,
  },
  {
    title: 'Target vs. Distributed',
    key: 'qty_progress',
    width: 250,
    render: (_, r) => {
      const pct = deliveryPercent(r);
      return (
        <div style={{ fontSize: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span>
              Distributed: <strong style={{ color: '#1a5f2c' }}>{toNumber(r.distributed_qty).toLocaleString()}</strong> / {toNumber(r.planned_target_qty).toLocaleString()} {r.unit}
            </span>
            <span style={{ fontWeight: 600, color: '#595959' }}>{pct}%</span>
          </div>
          <Progress percent={pct} showInfo={false} size="small" strokeColor="#1a5f2c" />
          {r.status && <Tag color={INPUT_STATUS_COLORS[r.status] || 'default'} style={{ fontSize: 10 }}>{r.status}</Tag>}
        </div>
      );
    },
  },
  {
    title: 'Covered Area',
    dataIndex: 'covered_hectares',
    key: 'covered_hectares',
    width: 130,
    render: (ha) => <strong style={{ color: '#1a5f2c' }}>{toNumber(ha).toLocaleString()} Ha</strong>,
  },
  {
    title: 'Beneficiaries',
    key: 'beneficiaries',
    width: 160,
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
    width: 150,
    render: (_, record) => (
      <Space size={2}>
        <Tooltip title="Log Dispatch / Distribution">
          <Button type="text" aria-label="Log dispatch" icon={<SendOutlined style={{ color: '#a16207' }} />} onClick={() => onDispatch(record)} />
        </Tooltip>
        <Tooltip title="View Full Dossier">
          <Button type="text" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
        </Tooltip>
        <Tooltip title="Edit Allocation Record">
          <Button type="text" aria-label="Edit allocation" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
        </Tooltip>
        <Popconfirm
          title="Delete input record?"
          description="Are you sure you want to permanently delete this allocation?"
          onConfirm={() => onDelete(record)}
        >
          <Button type="text" danger aria-label="Delete allocation" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  },
];

export default function AgriculturalInputUtilizationTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1350 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No input allocations recorded for this fiscal year' }}
    />
  );
}
