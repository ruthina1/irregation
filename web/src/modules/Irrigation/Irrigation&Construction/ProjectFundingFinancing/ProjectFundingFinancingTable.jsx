import { Button, Popconfirm, Progress, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, LinkOutlined, PayCircleOutlined } from '@ant-design/icons';
import { extractName } from '../../shared/utils';
import { ALLOCATION_STATUSES, FINANCING_PROGRAMS, toMillions } from './ProjectFundingFinancingManagement';

const buildColumns = ({ onView, onEdit, onDelete, onDisburse, onStatusChange, onOpenContract }) => [
  {
    title: 'Funding Code & Scheme Name',
    key: 'scheme_info',
    width: 270,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.scheme_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Fund: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.funding_code}</span> | Contract:
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
    title: 'Financing / Donor Program',
    dataIndex: 'funding_program',
    key: 'funding_program',
    width: 230,
    render: (prog) => {
      const item = FINANCING_PROGRAMS.find((p) => p.value === prog);
      return <div><Tag color={item ? item.color : 'default'}>{prog}</Tag></div>;
    },
  },
  {
    title: 'Allocated vs Disbursed (ETB)',
    key: 'budget_progress',
    width: 240,
    render: (_, r) => {
      const pct = Number(r.financial_burn_rate_pct) || 0;
      return (
        <div style={{ minWidth: 150, fontSize: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span>Disbursed: <strong style={{ color: '#1a5f2c' }}>{toMillions(r.cumulative_disbursed_etb)}M</strong> / {toMillions(r.total_allocated_budget_etb)}M ETB</span>
            <span style={{ fontWeight: 700, color: pct >= 80 ? '#1a5f2c' : '#5b8a6b' }}>{pct}%</span>
          </div>
          <Progress percent={pct} showInfo={false} size="small" strokeColor={pct >= 80 ? '#1a5f2c' : '#5b8a6b'} />
        </div>
      );
    },
  },
  {
    title: 'Remaining Balance',
    dataIndex: 'remaining_balance_etb',
    key: 'remaining_balance_etb',
    width: 160,
    render: (bal) => (
      <div>
        <strong style={{ color: '#a16207', fontSize: 13 }}>{toMillions(bal, 2)} M ETB</strong>
        <div style={{ fontSize: 10, color: '#8c8c8c' }}>Uncommitted Liquidity</div>
      </div>
    ),
  },
  {
    title: 'Account / Donor Ref',
    dataIndex: 'donor_account_ref',
    key: 'donor_account_ref',
    width: 170,
    render: (ref) => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{ref || '-'}</span>,
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
    title: 'Action Plan: Fiscal Status & Disbursement',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 290,
    render: (_, record) => (
      <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Select
          value={record.allocation_status}
          onChange={(value) => onStatusChange(record, value)}
          size="small"
          style={{ width: 145 }}
          popupMatchSelectWidth={false}
          aria-label="Allocation status"
          options={ALLOCATION_STATUSES.map((s) => ({ value: s.value, label: <Tag color={s.color} style={{ margin: 0 }}>{s.label}</Tag> }))}
        />
        <Space size="small">
          <Tooltip title="View Funding & Disbursement Dossier">
            <Button type="text" size="small" aria-label="View dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
          </Tooltip>
          <Tooltip title="Process Interim Disbursement Payment">
            <Button type="text" size="small" aria-label="Disburse payment" icon={<PayCircleOutlined style={{ color: '#1a5f2c', fontSize: 15 }} />} onClick={() => onDisburse(record)} />
          </Tooltip>
          <Tooltip title="Edit Allocation Parameters">
            <Button type="text" size="small" aria-label="Edit allocation" icon={<EditOutlined style={{ color: '#2f7d4a' }} />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm title="Delete funding record?" description="Are you sure you want to remove this financial record?" onConfirm={() => onDelete(record)}>
            <Button type="text" size="small" danger aria-label="Delete allocation" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </Space>
    ),
  },
];

export default function FundingTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1450 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No funding allocations registered for this fiscal year' }}
    />
  );
}
