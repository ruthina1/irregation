import { Button, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import { AuditOutlined, DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, ReadOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { ASSOCIATION_TYPES, GOVERNANCE_STATUSES } from './WaterUsersAssociationsManagement';

const buildColumns = ({ onView, onEdit, onDelete, onStatusChange, onNavigate }) => [
  {
    title: 'WUA Reg Code & Association Name',
    key: 'wua_info',
    width: 270,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.wua_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Reg: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.wua_reg_code}</span> | Decree: {r.registration_decree_ref?.split(' ')[0]}
        </div>
      </div>
    ),
  },
  {
    title: 'Scheme & Establishment Type',
    key: 'scheme_type',
    width: 230,
    render: (_, r) => {
      const item = ASSOCIATION_TYPES.find((t) => t.value === r.establishment_type);
      return (
        <div>
          <div style={{ fontWeight: 600, color: '#262626', fontSize: 12 }}>{r.scheme_name}</div>
          <Tag color={item ? item.color : 'default'} style={{ fontSize: 10, marginTop: 2 }}>{r.establishment_type}</Tag>
        </div>
      );
    },
  },
  {
    title: 'Members & Gender Split',
    key: 'members',
    width: 190,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Total: <strong style={{ color: '#1a5f2c', fontSize: 12 }}>{(toNumber(r.members_male) + toNumber(r.members_female)).toLocaleString()} Members</strong></div>
        <div style={{ color: '#8c8c8c', marginTop: 1 }}>
          M: <span style={{ color: '#5b8a6b', fontWeight: 600 }}>{r.members_male}</span> |
          F: <span style={{ color: '#64748b', fontWeight: 600 }}>{r.members_female}</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Committee & Water Master (ውሃ ዳኛ)',
    key: 'leadership',
    width: 230,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Chair: <strong>{r.chairperson_name}</strong></div>
        <div style={{ color: '#1a5f2c' }}>Water Master: {r.water_master_name}</div>
        <div style={{ color: '#8c8c8c', fontSize: 10 }}>
          Exec: {r.committee_male || 0}M / {r.committee_female || 0}F | Ketenas: {r.sub_ketenas_count || 0}
        </div>
      </div>
    ),
  },
  {
    title: 'Command & Distribution',
    key: 'distribution',
    width: 190,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Area: <strong style={{ color: '#1a5f2c' }}>{r.command_area_ha} Ha</strong></div>
        <div style={{ color: '#595959', fontSize: 10 }}>{r.distribution_regime?.split('(')[0]}</div>
      </div>
    ),
  },
  {
    title: 'Water Fee & Finance',
    key: 'finance',
    width: 160,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Fee: <strong>{r.annual_water_fee_etb_ha} ETB/Ha</strong></div>
        <div>Collection: <Tag color={r.fee_collection_rate_pct >= 85 ? 'success' : 'warning'}>{r.fee_collection_rate_pct}%</Tag></div>
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
    title: 'Action Plan: Governance & Operations',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 290,
    render: (_, record) => (
      <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Select
          value={record.governance_status}
          onChange={(value) => onStatusChange(record, value)}
          size="small"
          style={{ width: 155 }}
          popupMatchSelectWidth={false}
          aria-label="Governance status"
          options={GOVERNANCE_STATUSES.map((s) => ({
            value: s.value,
            label: <Tag color={s.color} style={{ margin: 0 }}>{s.label.split('(')[0]}</Tag>,
          }))}
        />
        <Space size="small">
          <Tooltip title="View Complete WUA Legal Dossier">
            <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Audit & Strengthen Association">
            <Button type="text" size="small" aria-label="Audit association" icon={<AuditOutlined style={{ color: '#a16207' }} />} onClick={() => onNavigate('/irrigation/institutions/assessment-audit', record)} />
          </Tooltip>
          <Tooltip title="WUA Leadership Training">
            <Button type="text" size="small" aria-label="Leadership training" icon={<ReadOutlined style={{ color: '#64748b' }} />} onClick={() => onNavigate('/irrigation/institutions/capacity-building', record)} />
          </Tooltip>
          <Tooltip title="Edit WUA Profile">
            <Button type="text" size="small" aria-label="Edit association" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete WUA record?"
            description="Are you sure you want to remove this association from the registry?"
            onConfirm={() => onDelete(record)}
          >
            <Button type="text" size="small" danger aria-label="Delete association" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </Space>
    ),
  },
];

export default function WuaTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No Water Users Associations registered for this fiscal year' }}
    />
  );
}
