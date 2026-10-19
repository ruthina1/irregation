import { Button, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { CANAL_NETWORK_TYPES, OPERATION_STATUSES, interventionList, isCleaningTag } from './SchemeMaintenanceCleaningManagement';

const formatCost = (r) => {
  if (r.financial_cost_etb === null || r.financial_cost_etb === undefined) return 'Cost: Not tracked';
  return `Cost: ${(toNumber(r.financial_cost_etb) / 1000).toFixed(0)}k ETB`;
};

const buildColumns = ({ onView, onEdit, onDelete, onStatusChange }) => [
  {
    title: 'Irrigation Scheme & Operating WUA',
    key: 'scheme_info',
    width: 280,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
        <div style={{ fontSize: 11, color: '#5b8a6b', marginTop: 2 }}>WUA: <strong>{r.wua_name}</strong></div>
      </div>
    ),
  },
  {
    title: 'Canal Type (Excel Indicator)',
    dataIndex: 'canal_type',
    key: 'canal_type',
    width: 190,
    render: (t) => {
      const item = CANAL_NETWORK_TYPES.find((c) => c.value === t);
      return <Tag color={item ? item.color : 'default'}>{t}</Tag>;
    },
  },
  {
    title: 'Multi-Select Interventions',
    key: 'interventions_display',
    width: 270,
    render: (_, r) => {
      const types = interventionList(r.intervention_types);
      return (
        <div>
          <div style={{ fontSize: 11, color: '#1a5f2c', marginBottom: 4 }}>Delivered: <strong>{r.repaired_cleaned_km} km</strong></div>
          <Space wrap size={[4, 4]}>
            {types.slice(0, 2).map((item) => (
              <Tag key={item} color={isCleaningTag(item) ? 'green' : 'orange'} style={{ fontSize: 10, margin: 0 }}>
                {item.split('(')[0]}
              </Tag>
            ))}
            {types.length > 2 && <Tag style={{ fontSize: 10, margin: 0 }}>+{types.length - 2} more</Tag>}
          </Space>
        </div>
      );
    },
  },
  {
    title: 'Mobilized Labor & Expenditure',
    key: 'labor_cost',
    width: 220,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>
          Labor: <strong>{(toNumber(r.mobilized_labor_male) + toNumber(r.mobilized_labor_female)).toLocaleString()} Farmers</strong>
          {' '}(M: {toNumber(r.mobilized_labor_male)} / F: {toNumber(r.mobilized_labor_female)})
        </div>
        <div style={{ color: '#5b8a6b', marginTop: 2 }}>
          {formatCost(r)} ({r.funding_source?.split('(')[0]})
        </div>
      </div>
    ),
  },
  {
    title: 'Protected Command Area',
    dataIndex: 'command_area_protected_ha',
    key: 'command_area_protected_ha',
    width: 150,
    render: (ha) => <strong style={{ color: '#1a5f2c' }}>{toNumber(ha).toLocaleString()} Ha</strong>,
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
    title: 'Action Plan: Status & Controls',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 250,
    render: (_, record) => (
      <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Select
          value={record.operation_status}
          onChange={(value) => onStatusChange(record, value)}
          size="small"
          style={{ width: 155 }}
          popupMatchSelectWidth={false}
          aria-label="Operation status"
          options={OPERATION_STATUSES.map((s) => ({
            value: s.value,
            label: <Tag color={s.color} style={{ margin: 0 }}>{s.label.split('(')[0]}</Tag>,
          }))}
        />
        <Space size="small">
          <Tooltip title="View Complete O&M Dossier">
            <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Edit O&M Record">
            <Button type="text" size="small" aria-label="Edit record" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete O&M record?"
            description="Are you sure you want to remove this record?"
            onConfirm={() => onDelete(record)}
          >
            <Button type="text" size="small" danger aria-label="Delete record" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </Space>
    ),
  },
];

export default function MaintenanceTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No maintenance or cleaning interventions logged for this fiscal year' }}
    />
  );
}
