import { Button, Popconfirm, Select, Space, Switch, Table, Tag, Tooltip } from 'antd';
import { CalendarOutlined, DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { WHEAT_STATUSES } from './HighlandIrrigatedWheatManagement';

const buildColumns = ({ onView, onEdit, onDelete, onStatusChange, onMechanizedChange, onOpenScheme }) => [
  {
    title: 'Initiative Ref & Scheme Name',
    key: 'scheme_info',
    width: 270,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Ref: <span style={{ fontFamily: 'monospace' }}>{r.initiative_code}</span>
          {r.scheme_code && (
            <>
              {' | '}
              <Tooltip title="View Scheme in Construction">
                <Tag color="default" style={{ fontSize: 10, cursor: 'pointer', marginLeft: 4 }} onClick={() => onOpenScheme(r.scheme_code)}>
                  <LinkOutlined style={{ marginRight: 2 }} />{r.scheme_code}
                </Tag>
              </Tooltip>
            </>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#a16207', marginTop: 2, fontWeight: 600 }}>Cluster: {r.cluster_block_code}</div>
      </div>
    ),
  },
  {
    title: 'Variety, Season & Harvesting',
    key: 'variety_season',
    width: 210,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#262626' }}>{r.wheat_variety}</strong>
        <div style={{ fontSize: 11, color: '#5b8a6b', marginTop: 2 }}>{r.cropping_round?.split('(')[0]}</div>
        <Tooltip title="Mechanized (combine) harvesting">
          <Switch
            size="small"
            style={{ marginTop: 4 }}
            checked={Boolean(r.mechanized_harvesting)}
            checkedChildren="Combine"
            unCheckedChildren="Manual"
            aria-label="Mechanized harvesting"
            onChange={(checked) => onMechanizedChange(r, checked)}
          />
        </Tooltip>
      </div>
    ),
  },
  {
    title: 'Area & Expected Yield (Qt)',
    key: 'yield_metrics',
    width: 220,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Area: <strong style={{ color: '#1a5f2c' }}>{toNumber(r.wheat_command_ha).toLocaleString()} Ha</strong></div>
        <div>Harvest: <strong style={{ color: '#a16207' }}>{toNumber(r.expected_yield_qt).toLocaleString()} Quintals</strong></div>
        <div style={{ color: '#5b8a6b', fontWeight: 600, marginTop: 1 }}>Productivity: {toNumber(r.productivity_qt_ha)} Qt / Ha</div>
      </div>
    ),
  },
  {
    title: 'Beneficiary Farmers (Gender Split)',
    key: 'farmers_split',
    width: 190,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Total: <strong style={{ color: '#1a5f2c' }}>{(toNumber(r.farmers_male) + toNumber(r.farmers_female)).toLocaleString()} Households</strong></div>
        <div style={{ color: '#8c8c8c' }}>
          M: <span style={{ color: '#5b8a6b', fontWeight: 600 }}>{r.farmers_male}</span> |
          F: <span style={{ color: '#64748b', fontWeight: 600 }}>{r.farmers_female}</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Survey Date (E.C.)',
    dataIndex: 'field_survey_eth_date',
    key: 'field_survey_eth_date',
    width: 160,
    render: (d) => <span><CalendarOutlined style={{ marginRight: 4, color: '#1a5f2c' }} />{d}</span>,
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
    title: 'Action Plan: Verification',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 250,
    render: (_, record) => (
      <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Select
          value={record.verification_status}
          onChange={(value) => onStatusChange(record, value)}
          size="small"
          style={{ width: 165 }}
          popupMatchSelectWidth={false}
          aria-label="Verification status"
          options={WHEAT_STATUSES.map((s) => ({
            value: s.value,
            label: <Tag color={s.color} style={{ margin: 0 }}>{s.label.split('(')[0]}</Tag>,
          }))}
        />
        <Space size="small">
          <Tooltip title="View Wheat Initiative Dossier">
            <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Edit Wheat Cluster Record">
            <Button type="text" size="small" aria-label="Edit wheat cluster record" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete wheat record?"
            description="Are you sure you want to remove this record?"
            onConfirm={() => onDelete(record)}
          >
            <Button type="text" size="small" danger aria-label="Delete wheat cluster record" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </Space>
    ),
  },
];

export default function WheatTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1460 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No highland wheat cluster records for this fiscal year' }}
    />
  );
}
