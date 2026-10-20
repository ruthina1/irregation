import { Button, Progress, Table, Tag, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { EMPTY_TEXT, fmt, PROGRESS_BAR_COLORS } from '../shared/reportUtils';

export default function BeneficiaryTable({ rows = [], loading, onView }) {
  const columns = [
    {
      title: 'Administrative Zone (ዞን)',
      dataIndex: 'zone',
      key: 'zone',
      width: 180,
      render: (z) => <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{z}</strong>,
    },
    {
      title: 'Schemes & Command (Ha)',
      key: 'schemes_command',
      width: 200,
      render: (_, r) => (
        <div>
          <span><strong>{r.schemes_count ?? 0} Schemes</strong> ({r.woreda_count ?? 0} Woredas)</span>
          <div style={{ color: '#5b8a6b', fontSize: 11 }}>{fmt(r.command_area_ha)} Ha Command</div>
        </div>
      ),
    },
    {
      title: 'Total Farmers (ድምር)',
      key: 'total_farmers',
      width: 180,
      render: (_, r) => {
        const total = Number(r.total_farmers) || ((Number(r.farmers_male) || 0) + (Number(r.farmers_female) || 0));
        return (
          <div>
            <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{fmt(total)}</strong>
            <div style={{ color: '#6b7280', fontSize: 11 }}>
              M: {fmt(r.farmers_male)} / F: {fmt(r.farmers_female)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Gender Rate (%)',
      key: 'gender_rate',
      width: 170,
      render: (_, r) => {
        const pct = Number(r.female_share_pct) || 0;
        return (
          <div style={{ minWidth: 100 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, color: '#64748b' }}>{pct}% Women</span>
            </div>
            <Progress
              percent={pct}
              size="small"
              strokeColor={PROGRESS_BAR_COLORS.blue}
              trailColor={PROGRESS_BAR_COLORS.trail}
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: 'Youth Farmers',
      dataIndex: 'youth_farmers',
      key: 'youth_farmers',
      width: 130,
      render: (y) => <Tag color="orange" style={{ fontWeight: 600 }}>{fmt(y)} Youth</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Tooltip title="View Full Beneficiary Dossier">
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
