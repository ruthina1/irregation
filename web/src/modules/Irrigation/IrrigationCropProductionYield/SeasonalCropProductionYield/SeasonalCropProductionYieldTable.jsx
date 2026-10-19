import { Button, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import { CalendarOutlined, DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { HARVEST_STATUSES } from './SeasonalCropProductionYieldManagement';

const buildColumns = ({ onView, onEdit, onDelete, onStatusChange, onOpenScheme }) => [
  {
    title: 'Production Code & Scheme Name',
    key: 'scheme_info',
    width: 270,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Ref: <span style={{ fontFamily: 'monospace' }}>{r.production_code}</span>
          {r.scheme_code && (
            <>
              {' | '}
              <Tooltip title="View Master Construction Contract">
                <Tag color="default" style={{ fontSize: 10, cursor: 'pointer', marginLeft: 4 }} onClick={() => onOpenScheme(r.scheme_code)}>
                  <LinkOutlined style={{ marginRight: 2 }} />{r.scheme_code}
                </Tag>
              </Tooltip>
            </>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#5b8a6b', marginTop: 2 }}>{r.cropping_round}</div>
      </div>
    ),
  },
  {
    title: 'Crop & Category (Excel Indicator)',
    key: 'crop_info',
    width: 230,
    render: (_, r) => (
      <div>
        <div style={{ fontWeight: 600, color: '#262626', fontSize: 12 }}>{r.specific_crop}</div>
        <Tag color="default" style={{ fontSize: 10, marginTop: 2 }}>{r.crop_category?.split('(')[0]}</Tag>
      </div>
    ),
  },
  {
    title: 'Cultivated Area & Yield (Qt)',
    key: 'yield_metrics',
    width: 220,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Area: <strong style={{ color: '#1a5f2c' }}>{toNumber(r.cultivated_area_ha).toLocaleString()} Ha</strong></div>
        <div>Harvest: <strong style={{ color: '#a16207' }}>{toNumber(r.production_yield_quintals).toLocaleString()} Quintals</strong></div>
        <div style={{ color: '#5b8a6b', fontWeight: 600, marginTop: 1 }}>Productivity: {r.productivity_qt_per_ha} Qt / Ha</div>
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
    dataIndex: 'survey_ethiopian_date',
    key: 'survey_ethiopian_date',
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
    title: 'Action Plan: Harvest Verification',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 260,
    render: (_, record) => (
      <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Select
          value={record.harvest_status}
          onChange={(value) => onStatusChange(record, value)}
          size="small"
          style={{ width: 165 }}
          popupMatchSelectWidth={false}
          aria-label="Harvest status"
          options={HARVEST_STATUSES.map((s) => ({
            value: s.value,
            label: <Tag color={s.color} style={{ margin: 0 }}>{s.label.split('(')[0]}</Tag>,
          }))}
        />
        <Space size="small">
          <Tooltip title="View Crop Production Dossier">
            <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Edit Production Record">
            <Button type="text" size="small" aria-label="Edit production record" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete harvest record?"
            description="Are you sure you want to remove this production yield record?"
            onConfirm={() => onDelete(record)}
          >
            <Button type="text" size="small" danger aria-label="Delete production record" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </Space>
    ),
  },
];

export default function SeasonalTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No seasonal crop production records for this fiscal year' }}
    />
  );
}
