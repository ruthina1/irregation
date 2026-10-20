import { Button, Progress, Table, Tag, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { EMPTY_TEXT, fmt, millions, PROGRESS_BAR_COLORS } from '../shared/reportUtils';

export default function ConstructionProgramTable({ rows = [], loading, onView }) {
  const columns = [
    {
      title: 'Financing Channel (የበጀት ምንጭ/ፕሮግራም)',
      dataIndex: 'program',
      key: 'program',
      width: 200,
      render: (p) => <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{p}</strong>,
    },
    {
      title: 'Active Schemes (አዲስ/ነባር)',
      key: 'schemes',
      width: 180,
      render: (_, r) => (
        <span>
          <Tag color="default">New: {r.new_schemes_count ?? 0}</Tag>
          <Tag color="gold">Rehab: {r.existing_rehab_count ?? 0}</Tag>
        </span>
      ),
    },
    {
      title: 'Disbursed / Allocation (ETB)',
      key: 'budget',
      width: 220,
      render: (_, r) => {
        const allocated = Number(r.allocated_budget_etb) || 0;
        const rate = allocated > 0 ? Math.round(((Number(r.disbursed_etb) || 0) / allocated) * 100) : 0;
        return (
          <div style={{ fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>{millions(r.disbursed_etb)}M</strong> / {millions(r.allocated_budget_etb)}M ETB</span>
              <Tag color={rate >= 70 ? 'success' : 'default'} style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
                {rate}%
              </Tag>
            </div>
            <Progress
              percent={rate}
              size="small"
              strokeColor={rate >= 70 ? PROGRESS_BAR_COLORS.green : PROGRESS_BAR_COLORS.yellow}
              trailColor={PROGRESS_BAR_COLORS.trail}
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: 'Command Area (ሄ/ር)',
      dataIndex: 'developed_land_ha',
      key: 'developed_land_ha',
      width: 160,
      render: (ha) => <strong style={{ color: '#1a5f2c' }}>{fmt(ha)} Ha</strong>,
    },
    {
      title: 'Beneficiaries',
      dataIndex: 'beneficiaries_total',
      key: 'beneficiaries_total',
      width: 160,
      render: (f) => `${fmt(f)} Farmers`,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Tooltip title="View Full Construction Dossier">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined style={{ color: '#1a5f2c', fontSize: 15 }} />}
            onClick={(e) => {
              e.stopPropagation();
              onView?.(r);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={rows}
      rowKey={(r) => r.program || r.key || Math.random()}
      loading={loading}
      pagination={false}
      bordered
      size="middle"
      locale={{ emptyText: EMPTY_TEXT }}
      onRow={(record) => ({
        onClick: () => onView?.(record),
        style: { cursor: 'pointer' },
        className: 'irr-table-clickable-row',
      })}
    />
  );
}
