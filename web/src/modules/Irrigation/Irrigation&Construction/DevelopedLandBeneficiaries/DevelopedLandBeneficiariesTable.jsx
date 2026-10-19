import { Button, Popconfirm, Progress, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { BENEFIT_STATUSES, cropList } from './DevelopedLandBeneficiariesManagement';

const buildColumns = ({ onView, onEdit, onDelete, onStatusChange, onOpenContract }) => [
  {
    title: 'Benefit Code & Scheme Name',
    key: 'scheme_info',
    width: 270,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Code: <span style={{ fontFamily: 'monospace' }}>{r.benefit_code}</span> | Contract:
          <Tooltip title="View Master Construction Contract">
            <Tag color="default" style={{ fontSize: 10, cursor: 'pointer', marginLeft: 4 }} onClick={() => onOpenContract(r.contract_code)}>
              <LinkOutlined style={{ marginRight: 2 }} />{r.contract_code}
            </Tag>
          </Tooltip>
        </div>
      </div>
    ),
  },
  {
    title: 'Command Area Coverage (Ha)',
    key: 'area_coverage',
    width: 230,
    render: (_, r) => {
      const planned = toNumber(r.planned_command_ha);
      const developed = toNumber(r.actual_developed_ha);
      const pct = planned > 0 ? Math.round((developed / planned) * 100) : 0;
      return (
        <div style={{ minWidth: 140, fontSize: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span>Developed: <strong style={{ color: '#1a5f2c' }}>{developed}</strong> / {planned} Ha</span>
            <span style={{ fontWeight: 700, color: pct >= 80 ? '#1a5f2c' : '#5b8a6b' }}>{pct}%</span>
          </div>
          <Progress percent={pct} showInfo={false} size="small" strokeColor={pct >= 80 ? '#1a5f2c' : '#5b8a6b'} />
          <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>
            Active Cultivated: <strong>{toNumber(r.operational_cultivated_ha)} Ha</strong>
          </div>
        </div>
      );
    },
  },
  {
    title: 'Beneficiary Farmers (Gender Split)',
    key: 'beneficiaries_split',
    width: 200,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Total: <strong style={{ color: '#1a5f2c', fontSize: 12 }}>{(toNumber(r.beneficiaries_male) + toNumber(r.beneficiaries_female)).toLocaleString()} Households</strong></div>
        <div style={{ color: '#8c8c8c', marginTop: 1 }}>
          M: <span style={{ color: '#5b8a6b', fontWeight: 600 }}>{r.beneficiaries_male}</span> |
          F: <span style={{ color: '#64748b', fontWeight: 600 }}>{r.beneficiaries_female}</span>
          {toNumber(r.youth_beneficiaries_count) > 0 && (
            <span style={{ marginLeft: 6, color: '#a16207' }}>(Youth: {r.youth_beneficiaries_count})</span>
          )}
        </div>
      </div>
    ),
  },
  {
    title: 'Cultivated Crop Catalog',
    key: 'crops_intensity',
    width: 260,
    render: (_, r) => {
      const crops = cropList(r.primary_crops_cultivated);
      return (
        <div>
          <div style={{ fontSize: 11, marginBottom: 4 }}>
            Intensity: <strong style={{ color: '#1a5f2c' }}>{r.cropping_intensity_ratio}x Annual Cycles</strong>
          </div>
          <Space wrap size={[4, 4]}>
            {crops.slice(0, 3).map((crop) => (
              <Tag key={crop} color="green" style={{ fontSize: 10, margin: 0 }}>{crop.split('(')[0]}</Tag>
            ))}
            {crops.length > 3 && <Tag style={{ fontSize: 10, margin: 0 }}>+{crops.length - 3} more</Tag>}
          </Space>
        </div>
      );
    },
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
    title: 'Action Plan: Verification & Status',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 280,
    render: (_, record) => (
      <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Select
          value={record.benefit_status}
          onChange={(value) => onStatusChange(record, value)}
          size="small"
          style={{ width: 175 }}
          popupMatchSelectWidth={false}
          aria-label="Operational status"
          options={BENEFIT_STATUSES.map((s) => ({ value: s.value, label: <Tag color={s.color} style={{ margin: 0 }}>{s.label}</Tag> }))}
        />
        <Space size="small">
          <Tooltip title="View Socio-Economic Impact Dossier">
            <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Edit Agronomic Survey Record">
            <Button type="text" size="small" aria-label="Edit record" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm title="Delete benefit record?" description="Are you sure you want to remove this record?" onConfirm={() => onDelete(record)}>
            <Button type="text" size="small" danger aria-label="Delete record" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </Space>
    ),
  },
];

export default function BenefitTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No developed land verifications recorded for this fiscal year' }}
    />
  );
}
