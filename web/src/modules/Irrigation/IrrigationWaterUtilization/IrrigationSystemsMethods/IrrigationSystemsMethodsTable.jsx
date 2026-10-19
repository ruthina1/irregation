import { Button, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { technologyColor, TECHNOLOGY_STATUSES } from './IrrigationSystemsMethodsManagement';

const buildColumns = ({ onView, onEdit, onDelete, onStatusChange }) => [
  {
    title: 'Irrigation Scheme & Operating WUA',
    key: 'scheme_info',
    width: 270,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
        <div style={{ fontSize: 11, color: '#5b8a6b', marginTop: 2 }}>WUA: <strong>{r.wua_name}</strong></div>
      </div>
    ),
  },
  {
    title: 'Abstraction Tech / Source (Excel Indicator)',
    dataIndex: 'technology_type',
    key: 'technology_type',
    width: 260,
    render: (tech) => <Tag color={technologyColor(tech)}>{tech}</Tag>,
  },
  {
    title: 'Discharge Yield (L/s)',
    dataIndex: 'discharge_capacity_liters_sec',
    key: 'discharge_capacity_liters_sec',
    width: 150,
    render: (d) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{toNumber(d).toLocaleString()} L/s</strong>
        <div style={{ fontSize: 10, color: '#8c8c8c' }}>Flow Rate</div>
      </div>
    ),
  },
  {
    title: 'Command Area Served',
    dataIndex: 'command_area_served_ha',
    key: 'command_area_served_ha',
    width: 140,
    render: (ha) => <strong style={{ color: '#1a5f2c' }}>{toNumber(ha).toLocaleString()} Ha</strong>,
  },
  {
    title: 'Energy / Drive Source',
    dataIndex: 'energy_source',
    key: 'energy_source',
    width: 180,
    render: (e) => <span style={{ fontSize: 11, color: '#595959' }}>{e}</span>,
  },
  {
    title: 'Beneficiaries',
    key: 'farmers_split',
    width: 160,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Total: <strong style={{ color: '#1a5f2c' }}>{(toNumber(r.farmers_male) + toNumber(r.farmers_female)).toLocaleString()}</strong></div>
        <div style={{ color: '#8c8c8c' }}>M: {r.farmers_male} | F: {r.farmers_female}</div>
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
          <span><EnvironmentOutlined style={{ color: '#1a5f2c', marginRight: 4 }} /><strong>{extractName(r.kebele)}</strong></span>
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
          value={record.operational_status}
          onChange={(value) => onStatusChange(record, value)}
          size="small"
          style={{ width: 155 }}
          popupMatchSelectWidth={false}
          aria-label="Operational status"
          options={TECHNOLOGY_STATUSES.map((s) => ({ value: s.value, label: <Tag color={s.color} style={{ margin: 0 }}>{s.label.split('(')[0]}</Tag> }))}
        />
        <Space size="small">
          <Tooltip title="View Complete Technology Dossier">
            <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Edit Technology Record">
            <Button type="text" size="small" aria-label="Edit record" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete source record?"
            description="Are you sure you want to remove this water abstraction technology record?"
            onConfirm={() => onDelete(record)}
          >
            <Button type="text" size="small" danger aria-label="Delete record" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </Space>
    ),
  },
];

export default function WaterSourceTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No water sources or technologies recorded for this fiscal year' }}
    />
  );
}
