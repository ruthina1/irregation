import { Button, Popconfirm, Progress, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, FileProtectOutlined, LineChartOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { CONSTRUCTION_STATUSES } from './ConstructionProjectsManagement';

const progressColor = (pct) => (pct >= 66 ? '#1a5f2c' : pct >= 30 ? '#5b8a6b' : '#a16207');

const buildColumns = ({ onView, onEdit, onDelete, onStatusChange, onEvaluate, onHandover, onOpenShelf }) => [
  {
    title: 'Contract Code & Scheme Name',
    key: 'scheme_info',
    width: 270,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Contract: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.contract_code}</span> | Ref:
          <Tooltip title="View Approved Design in Construction-Ready Shelf">
            <Tag color="green" style={{ fontSize: 10, cursor: 'pointer', marginLeft: 4 }} onClick={() => onOpenShelf(r)}>
              <LinkOutlined style={{ marginRight: 2 }} />{r.project_code}
            </Tag>
          </Tooltip>
        </div>
      </div>
    ),
  },
  {
    title: 'Classification & Funding',
    key: 'class_funding',
    width: 240,
    render: (_, r) => (
      <div>
        <Tag color="default">{r.scheme_type}</Tag>
        <div style={{ fontSize: 11, color: '#595959', marginTop: 2 }}>{r.funding_source?.split('(')[0]}</div>
      </div>
    ),
  },
  {
    title: 'Contractor & Supervision',
    key: 'entities',
    width: 240,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div style={{ fontWeight: 600, color: '#262626' }}>{r.contractor_name}</div>
        <div style={{ color: '#5b8a6b', fontSize: 10 }}>{r.contractor_grade?.split('(')[0]}</div>
        <div style={{ color: '#8c8c8c' }}>Consultant: {r.consultant_supervisor}</div>
      </div>
    ),
  },
  {
    title: 'Physical Progress (%)',
    key: 'physical_progress',
    width: 170,
    render: (_, r) => {
      const pct = toNumber(r.physical_progress_pct);
      return (
        <div style={{ minWidth: 120 }}>
          <div style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontWeight: 700, color: progressColor(pct) }}>{pct}%</span>
            <span style={{ color: '#8c8c8c', fontSize: 10 }}>{pct >= 100 ? 'Completed' : 'On Site'}</span>
          </div>
          <Progress percent={pct} showInfo={false} size="small" strokeColor={progressColor(pct)} />
        </div>
      );
    },
  },
  {
    title: 'Command Area & Farmers',
    key: 'benefits',
    width: 170,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div style={{ fontWeight: 700, color: '#1a5f2c' }}>{toNumber(r.command_area_ha).toLocaleString()} Ha</div>
        <div style={{ color: '#8c8c8c' }}>
          Beneficiaries: {(toNumber(r.beneficiaries_male) + toNumber(r.beneficiaries_female)).toLocaleString()}
        </div>
        {r.wua_name && <div style={{ color: '#64748b', fontSize: 10 }}>WUA: {r.wua_name}</div>}
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
    title: 'Action Plan: Milestone & Controls',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 320,
    render: (_, record) => {
      const isHandedOver = record.construction_status === 'Handed Over to Users';
      return (
        <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Select
            value={record.construction_status}
            onChange={(value) => onStatusChange(record, value)}
            size="small"
            style={{ width: 145 }}
            popupMatchSelectWidth={false}
            aria-label="Construction status"
            options={CONSTRUCTION_STATUSES.map((s) => ({
              value: s.value,
              label: <Tag color={s.color} style={{ margin: 0 }}>{s.label}</Tag>,
            }))}
          />
          <Space size="small">
            <Tooltip title="View Construction Progress Dossier">
              <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
            </Tooltip>
            <Tooltip title="Evaluate Site Progress / Log Inspection">
              <Button type="text" size="small" aria-label="Evaluate progress" icon={<LineChartOutlined style={{ color: '#1a5f2c', fontSize: 15 }} />} onClick={() => onEvaluate(record)} />
            </Tooltip>
            <Tooltip title={isHandedOver ? 'Formal WUA Handover Protocol Registered' : 'Initiate Formal Handover to Water Users Association'}>
              <Button
                type="text"
                size="small"
                aria-label="Handover to WUA"
                icon={<FileProtectOutlined style={{ color: isHandedOver ? '#2f7d4a' : '#8c8c8c', fontSize: 15 }} />}
                onClick={() => onHandover(record)}
              />
            </Tooltip>
            <Tooltip title="Edit Contract Parameters">
              <Button type="text" size="small" aria-label="Edit contract" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
            </Tooltip>
            <Popconfirm
              title="Delete contract record?"
              description="Are you sure you want to remove this construction project?"
              onConfirm={() => onDelete(record)}
            >
              <Button type="text" size="small" danger aria-label="Delete contract" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        </Space>
      );
    },
  },
];

export default function ProjectTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No construction contracts registered for this fiscal year' }}
    />
  );
}
