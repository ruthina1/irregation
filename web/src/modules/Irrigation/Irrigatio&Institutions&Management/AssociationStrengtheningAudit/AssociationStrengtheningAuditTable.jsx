import { Button, Popconfirm, Progress, Space, Table, Tag, Tooltip } from 'antd';
import { AuditOutlined, DeleteOutlined, EnvironmentOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import { extractName, toNumber } from '../../shared/utils';
import { AUDIT_VERDICTS, gradeShort, isPendingAudit, scoreColor } from './AssociationStrengtheningAuditManagement';

const buildColumns = ({ onView, onAudit, onDelete, onOpenWua }) => [
  {
    title: 'Audit Code & Association Name',
    key: 'wua_info',
    width: 280,
    render: (_, r) => (
      <div>
        <strong style={{ color: '#1a5f2c', fontSize: 13 }}>{r.wua_name}</strong>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
          Audit: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.audit_code}</span> | WUA:
          <Tooltip title="View WUA Master Registry">
            <Tag color="default" style={{ fontSize: 10, cursor: 'pointer', marginLeft: 4 }} onClick={() => onOpenWua(r.wua_name)}>
              <LinkOutlined style={{ marginRight: 2 }} />{r.wua_reg_code}
            </Tag>
          </Tooltip>
        </div>
      </div>
    ),
  },
  {
    title: 'Audit Opinion Verdict',
    dataIndex: 'audit_verdict',
    key: 'audit_verdict',
    width: 210,
    render: (verdict) => {
      const item = AUDIT_VERDICTS.find((v) => v.value === verdict);
      return <Tag color={item ? item.color : 'default'}>{verdict || 'Not recorded'}</Tag>;
    },
  },
  {
    title: 'Governance Grade & Health Score',
    key: 'governance_score',
    width: 220,
    render: (_, r) => {
      const hasScore = r.overall_health_score !== null && r.overall_health_score !== undefined;
      if (isPendingAudit(r) && !hasScore) {
        return <span style={{ fontSize: 11, color: '#8c8c8c' }}>Awaiting yearly audit (grade not assigned)</span>;
      }
      const score = toNumber(r.overall_health_score);
      return (
        <div style={{ minWidth: 140 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
            <span style={{ fontWeight: 600, color: '#262626' }}>{gradeShort(r.governance_grade) || 'Not graded'}</span>
            <span style={{ fontWeight: 700, color: hasScore ? scoreColor(score) : '#8c8c8c' }}>{hasScore ? `${score}%` : 'Not tracked'}</span>
          </div>
          <Progress percent={score} showInfo={false} size="small" strokeColor={scoreColor(score)} />
        </div>
      );
    },
  },
  {
    title: 'Audited Financials (ETB)',
    key: 'financials',
    width: 210,
    render: (_, r) => (isPendingAudit(r) && (r.audited_revenue_etb === null || r.audited_revenue_etb === undefined) ? (
      <span style={{ fontSize: 11, color: '#8c8c8c' }}>Not tracked</span>
    ) : (
      <div style={{ fontSize: 11 }}>
        <div>Revenue: <strong>{(toNumber(r.audited_revenue_etb) / 1000).toFixed(0)}k ETB</strong></div>
        <div style={{ color: '#595959' }}>Expense: {(toNumber(r.audited_expense_etb) / 1000).toFixed(0)}k ETB</div>
        {toNumber(r.unaccounted_variance_etb) > 0 && (
          <div style={{ color: '#b42318', fontWeight: 600 }}>Discrepancy: {toNumber(r.unaccounted_variance_etb).toLocaleString()} ETB</div>
        )}
      </div>
    )),
  },
  {
    title: 'Lead Auditor',
    dataIndex: 'lead_auditor',
    key: 'lead_auditor',
    width: 180,
    render: (auditor) => <span style={{ fontSize: 12, color: auditor ? undefined : '#8c8c8c' }}>{auditor || 'Not assigned'}</span>,
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
    title: 'Action Plan: Audit & Operations',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 200,
    render: (_, record) => (
      <Space size="small" align="center">
        <Tooltip title="View Yearly Audit Dossier">
          <Button type="text" size="small" aria-label="View audit dossier" icon={<EyeOutlined style={{ color: '#5b8a6b' }} />} onClick={() => onView(record)} />
        </Tooltip>
        <Tooltip title="Conduct Yearly Audit Inspection">
          <Button size="small" type="primary" icon={<AuditOutlined />} style={{ backgroundColor: '#1a5f2c', borderColor: '#1a5f2c', fontSize: 11 }}
            onClick={() => onAudit(record)}>
            Audit
          </Button>
        </Tooltip>
        <Popconfirm title="Delete audit record?" description="Are you sure you want to remove this regulatory audit inspection?" onConfirm={() => onDelete(record)}>
          <Button type="text" size="small" danger aria-label="Delete audit" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  },
];

export default function AuditTable({ data, loading, ...handlers }) {
  return (
    <Table
      columns={buildColumns(handlers)}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1400 }}
      bordered
      size="middle"
      locale={{ emptyText: 'No WUA audits for this fiscal year (an audit is opened automatically when a WUA is registered)' }}
    />
  );
}
