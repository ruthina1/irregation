import { Button, Progress, Table, Tag, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { EMPTY_TEXT, fmt, millions, PROGRESS_BAR_COLORS } from '../shared/reportUtils';

export function ZonalSynthesisTable({ rows = [], loading, onView }) {
  const columns = [
    {
      title: 'Administrative Zone (ዞን)',
      dataIndex: 'zone',
      key: 'zone',
      width: 180,
      render: (z) => <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{z}</strong>,
    },
    {
      title: 'Active Schemes & Progress (ግንባታ)',
      key: 'construction',
      width: 220,
      render: (_, r) => {
        const schemes = r.active_construction_schemes ?? 0;
        const progress = Number(r.avg_physical_progress_pct) || 0;
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
              <span><strong>{schemes} Schemes</strong> Active</span>
              <span style={{ fontWeight: 600, color: progress >= 60 ? '#1a5f2c' : '#d97706' }}>{progress}%</span>
            </div>
            <Progress
              percent={progress}
              size="small"
              strokeColor={PROGRESS_BAR_COLORS.green}
              trailColor={PROGRESS_BAR_COLORS.trail}
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: 'Capital Budget Execution (ETB)',
      key: 'budget',
      width: 220,
      render: (_, r) => {
        const allocated = Number(r.allocated_construction_budget_etb) || 0;
        const disbursed = Number(r.disbursed_budget_etb) || 0;
        const burnRate = allocated > 0 ? Math.round((disbursed / allocated) * 100) : 0;
        return (
          <div style={{ fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>{millions(disbursed)}M</strong> / {millions(allocated)}M ETB</span>
              <Tag color={burnRate >= 70 ? 'success' : 'default'} style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
                {burnRate}%
              </Tag>
            </div>
            <Progress
              percent={burnRate}
              size="small"
              strokeColor={burnRate >= 70 ? PROGRESS_BAR_COLORS.green : PROGRESS_BAR_COLORS.yellow}
              trailColor={PROGRESS_BAR_COLORS.trail}
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: 'Active Irrigated Area (ሄ/ር)',
      key: 'command',
      width: 180,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <strong style={{ color: '#1a5f2c' }}>{fmt(r.irrigated_actual_ha)} Ha</strong>
          <div style={{ color: '#6b7280', fontSize: 11 }}>Planned: {fmt(r.managed_command_ha)} Ha</div>
        </div>
      ),
    },
    {
      title: 'Beneficiary Farmers (ተጠቃሚዎች)',
      key: 'farmers',
      width: 170,
      render: (_, r) => {
        const total = Number(r.total_farmers) || ((Number(r.farmers_male) || 0) + (Number(r.farmers_female) || 0));
        return (
          <div style={{ fontSize: 12 }}>
            <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{fmt(total)}</strong>
            <div style={{ color: '#6b7280', fontSize: 11 }}>M: {fmt(r.farmers_male)} / F: {fmt(r.farmers_female)}</div>
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Tooltip title="View Full Zonal Dossier">
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
      rowKey={(r) => r.zone || r.key || Math.random()}
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

export function ProgramPortfolioTable({ rows = [], loading }) {
  const columns = [
    {
      title: 'Funding Channel / Program Source (የበጀት ምንጭ/ፕሮግራም)',
      dataIndex: 'program',
      key: 'program',
      render: (p) => <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{p}</strong>,
    },
    {
      title: 'Active Schemes Supported',
      dataIndex: 'schemes',
      key: 'schemes',
      width: 190,
      render: (s) => <Tag color="default">{s ?? 0} Schemes</Tag>,
    },
    {
      title: 'Allocated Capital Budget',
      dataIndex: 'allocated',
      key: 'allocated',
      width: 190,
      render: (a) => `${a ?? 0} Million ETB`,
    },
    {
      title: 'Disbursed to Date',
      dataIndex: 'disbursed',
      key: 'disbursed',
      width: 190,
      render: (d) => <strong style={{ color: '#1a5f2c' }}>{d ?? 0} Million ETB</strong>,
    },
    {
      title: 'Financial Burn Rate (%)',
      key: 'burn_rate',
      width: 220,
      render: (_, r) => {
        const allocated = Number(r.allocated) || 0;
        const disbursed = Number(r.disbursed) || 0;
        const rate = allocated > 0 ? Math.round((disbursed / allocated) * 100) : 0;
        return (
          <div style={{ minWidth: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
              <span style={{ fontWeight: 600 }}>{rate}%</span>
              <Tag color={rate >= 70 ? 'success' : rate >= 40 ? 'warning' : 'default'} style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
                {rate >= 70 ? 'Optimal' : 'Active'}
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
  ];

  return (
    <Table
      columns={columns}
      dataSource={rows}
      rowKey={(r) => r.program || Math.random()}
      loading={loading}
      pagination={false}
      bordered
      size="middle"
      locale={{ emptyText: EMPTY_TEXT }}
    />
  );
}

export default ZonalSynthesisTable;

