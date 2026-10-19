import { Button, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { SCHEME_LAND_MODALITIES, WATER_ADEQUACY_STATUSES } from './IrrigatedLandUtilizationManagement';

const buildColumns = ({ onView, onEdit, onDelete, onAdequacyChange, onOpenScheme }) => [
  {
    title: 'Scheme & Season',
    key: 'scheme_info',
    width: 270,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Ref: <span style={{ fontFamily: 'monospace' }}>{r.utilization_code}</span> |
          <Tooltip title="View Scheme in Construction">
            <Tag color="default" style={{ fontSize: 10, cursor: 'pointer', marginLeft: 4 }} onClick={() => onOpenScheme(r)}>
              <LinkOutlined style={{ marginRight: 2 }} />{r.scheme_code}
            </Tag>
          </Tooltip>
        </div>
        <div style={{ fontSize: 11, color: '#5b8a6b', marginTop: 2 }}>{r.cropping_round}</div>
      </div>
    ),
  },
  {
    title: 'Land Modality (Excel Indicator)',
    dataIndex: 'land_modality',
    key: 'land_modality',
    width: 190,
    render: (m) => {
      const item = SCHEME_LAND_MODALITIES.find((l) => l.value === m);
      return <Tag color={item ? item.color : 'default'}>{m?.split('(')[0]}</Tag>;
    },
  },
  {
    title: 'Irrigated Area vs Expansion (Ha)',
    key: 'area_coverage',
    width: 240,
    render: (_, r) => {
      const actual = toNumber(r.actual_irrigated_ha);
      const expansion = toNumber(r.expansion_area_ha);
      const total = r.total_effective_irrigated_ha ?? actual + expansion;
      return (
        <div style={{ minWidth: 150, fontSize: 11 }}>
          <div>Active: <strong style={{ color: '#1a5f2c' }}>{actual} Ha</strong> / {toNumber(r.planned_command_ha)} Ha</div>
          {expansion > 0 && (
            <div style={{ color: '#5b8a6b', fontSize: 10 }}>
              Expansion Area: +{expansion} Ha ({r.expansion_method?.split('(')[0]})
            </div>
          )}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#262626', marginTop: 2 }}>Total Effective: {total} Ha</div>
        </div>
      );
    },
  },
  {
    title: 'Farmer Beneficiaries',
    key: 'farmers_split',
    width: 190,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Total: <strong style={{ color: '#1a5f2c' }}>{(toNumber(r.farmers_male) + toNumber(r.farmers_female)).toLocaleString()} Farmers</strong></div>
        <div style={{ color: '#8c8c8c' }}>
          M: <span style={{ color: '#5b8a6b', fontWeight: 600 }}>{r.farmers_male}</span> |
          F: <span style={{ color: '#64748b', fontWeight: 600 }}>{r.farmers_female}</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Dominant Irrigated Crops',
    dataIndex: 'dominant_crops',
    key: 'dominant_crops',
    width: 220,
    render: (crops) => <span style={{ fontSize: 11, color: '#595959' }}>{crops}</span>,
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
    title: 'Action Plan: Water Adequacy',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 260,
    render: (_, record) => (
      <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Select
          value={record.water_adequacy_status}
          onChange={(value) => onAdequacyChange(record, value)}
          size="small"
          style={{ width: 165 }}
          popupMatchSelectWidth={false}
          aria-label="Water adequacy status"
          options={WATER_ADEQUACY_STATUSES.map((s) => ({
            value: s.value,
            label: <Tag color={s.color} style={{ margin: 0 }}>{s.label.split('(')[0]}</Tag>,
          }))}
        />
        <Space size="small">
          <Tooltip title="View Land Utilization Dossier">
            <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Edit Utilization Record">
            <Button type="text" size="small" aria-label="Edit record" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete utilization record?"
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

export default function UtilizationTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No irrigated land utilization records for this fiscal year' }}
    />
  );
}
