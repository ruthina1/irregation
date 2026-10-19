import { Button, Popconfirm, Progress, Select, Space, Table, Tag, Tooltip } from 'antd';
import { CalendarOutlined, DeleteOutlined, EditOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import { orNotTracked, PROGRESS_HEALTH_STATUSES } from './ConstructionProgressPerformanceManagement';

const HEALTH_OPTIONS = PROGRESS_HEALTH_STATUSES.map((s) => ({
  value: s.value,
  label: <Tag color={s.color} style={{ margin: 0 }}>{s.label}</Tag>,
}));

/** Progress-log ledger with quick schedule-health action. */
export default function ProgressTable({ data, loading, onView, onEdit, onDelete, onHealthChange, onOpenContract }) {
  const columns = [
    {
      title: 'Log Code & Scheme Name',
      key: 'scheme_info',
      width: 270,
      render: (_, r) => (
        <div>
          <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            Log: <span style={{ fontFamily: 'monospace' }}>{r.progress_log_code}</span> | Contract:
            <Tooltip title="View master contract in Construction Projects">
              <Tag
                color="default"
                style={{ fontSize: 10, cursor: 'pointer', marginLeft: 4 }}
                onClick={() => onOpenContract(r.contract_code)}
              >
                <LinkOutlined style={{ marginRight: 2 }} />{r.contract_code}
              </Tag>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: 'Classification',
      dataIndex: 'scheme_type',
      key: 'scheme_type',
      width: 170,
      render: (t) => <Tag color="default">{t}</Tag>,
    },
    {
      title: 'Physical Execution vs Plan',
      key: 'progress_compare',
      width: 230,
      render: (_, r) => {
        const physical = Number(r.physical_progress_pct) || 0;
        const planned = Number(r.planned_progress_pct) || 0;
        const variance = Number(r.variance_pct ?? physical - planned);
        const isAhead = variance >= 0;
        return (
          <div style={{ fontSize: 11, minWidth: 160 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>
                Actual: <strong style={{ color: physical >= 60 ? '#1a5f2c' : '#5b8a6b' }}>{physical}%</strong>
                <span style={{ color: '#8c8c8c', marginLeft: 4 }}>(Plan: {planned}%)</span>
              </span>
              <span style={{ color: isAhead ? '#2f7d4a' : '#b42318', fontWeight: 600 }}>
                {isAhead ? `+${variance.toFixed(1)}%` : `${variance.toFixed(1)}%`}
              </span>
            </div>
            <Progress
              percent={physical}
              showInfo={false}
              size="small"
              strokeColor={physical >= 66 ? '#1a5f2c' : physical >= 30 ? '#5b8a6b' : '#a16207'}
            />
          </div>
        );
      },
    },
    {
      title: 'Work-Breakdown Progress',
      key: 'wbs_progress',
      width: 220,
      render: (_, r) => (
        <div style={{ fontSize: 11, color: '#595959' }}>
          <div>Weir Concreting: <strong style={{ color: '#1a5f2c' }}>{orNotTracked(r.weir_concreting_pct, '%')}</strong></div>
          <div>Canal Lining: <strong>{orNotTracked(r.canal_lining_km)} / {orNotTracked(r.target_canal_lining_km)} km</strong></div>
          <div>Control Gates: <strong>{orNotTracked(r.gates_installed_count)} / {orNotTracked(r.target_gates_count)} Units</strong></div>
        </div>
      ),
    },
    {
      title: 'Resident Engineer',
      dataIndex: 'resident_engineer',
      key: 'resident_engineer',
      width: 170,
      render: (eng) => <span style={{ fontSize: 12 }}>{eng}</span>,
    },
    {
      title: 'Inspection Date (E.C.)',
      dataIndex: 'reporting_ethiopian_date',
      key: 'reporting_ethiopian_date',
      width: 170,
      render: (d) => <span><CalendarOutlined style={{ marginRight: 4, color: '#1a5f2c' }} />{d}</span>,
    },
    {
      title: 'Action Plan: Schedule Health',
      key: 'actions',
      align: 'left',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Select
            value={record.health_status}
            onChange={(value) => onHealthChange(record, value)}
            size="small"
            style={{ width: 160 }}
            popupMatchSelectWidth={false}
            options={HEALTH_OPTIONS}
            aria-label="Schedule health"
          />
          <Space size="small">
            <Tooltip title="View Detailed Progress Dossier">
              <Button type="text" size="small" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
            </Tooltip>
            <Tooltip title="Edit Site Inspection Log">
              <Button type="text" size="small" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
            </Tooltip>
            <Popconfirm
              title="Delete progress log?"
              description="Are you sure you want to remove this site update?"
              onConfirm={() => onDelete(record)}
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
    />
  );
}
