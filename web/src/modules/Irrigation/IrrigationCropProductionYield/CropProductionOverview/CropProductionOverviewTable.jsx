import { Table, Tag, Tooltip } from 'antd';
import { EnvironmentOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { ROUTES } from './CropProductionOverviewManagement';

const buildColumns = (onNavigate) => [
  {
    title: 'Irrigation Scheme & Code',
    key: 'scheme_info',
    width: 280,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Ref:
          {r.scheme_code ? (
            <Tooltip title="View Master Construction Contract">
              <Tag
                color="default"
                style={{ fontSize: 10, cursor: 'pointer', marginLeft: 4 }}
                onClick={() => onNavigate(ROUTES.projects, { state: { searchCode: r.scheme_code } })}
              >
                <LinkOutlined style={{ marginRight: 2 }} />{r.scheme_code}
              </Tag>
            </Tooltip>
          ) : <span style={{ marginLeft: 4 }}>Not linked</span>}
        </div>
      </div>
    ),
  },
  {
    title: 'Crop & Category',
    key: 'crop_info',
    width: 230,
    render: (_, r) => (
      <div>
        <div style={{ fontWeight: 600, color: '#262626' }}>{r.crop}</div>
        <Tag color="default" style={{ fontSize: 10, marginTop: 2 }}>{r.category}</Tag>
      </div>
    ),
  },
  { title: 'Cropping Season', dataIndex: 'round', key: 'round', width: 170, render: (rnd) => <Tag color="default">{rnd}</Tag> },
  { title: 'Cultivated Area', dataIndex: 'area_ha', key: 'area_ha', width: 140, render: (a) => `${toNumber(a).toLocaleString()} Ha` },
  {
    title: 'Harvest Yield (ኩንታል)',
    dataIndex: 'yield_qt',
    key: 'yield_qt',
    width: 170,
    render: (y) => <strong style={{ color: '#a16207', fontSize: 13 }}>{toNumber(y).toLocaleString()} Qt</strong>,
  },
  {
    title: 'Productivity Rate',
    dataIndex: 'productivity',
    key: 'productivity',
    width: 140,
    render: (p) => <Tag color="success" style={{ fontWeight: 700 }}>{p}</Tag>,
  },
  {
    title: 'Beneficiary Farmers',
    key: 'farmers',
    width: 170,
    render: (_, r) => (
      <div style={{ fontSize: 11 }}>
        <div>Total: <strong>{(toNumber(r.farmers_male) + toNumber(r.farmers_female)).toLocaleString()}</strong></div>
        <div style={{ color: '#8c8c8c' }}>
          M: <span style={{ color: '#5b8a6b' }}>{r.farmers_male}</span> | F: <span style={{ color: '#64748b' }}>{r.farmers_female}</span>
        </div>
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
];

export default function ProductionTable({ data, loading, onNavigate }) {
  return (
    <Table
      columns={buildColumns(onNavigate)}
      dataSource={data}
      rowKey="key"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No harvest records for this fiscal year' }}
    />
  );
}
